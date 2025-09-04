from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os
import json
from datetime import datetime
import requests
import math
from dotenv import load_dotenv
from openai import OpenAI

app = Flask(__name__)


# Load environment variables
load_dotenv()

# Configure Azure OpenAI API
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
AZURE_OPENAI_ENDPOINT = os.getenv('AZURE_OPENAI_ENDPOINT')
OPENWEATHER_API_KEY = os.getenv('OPENWEATHER_API_KEY')

# Initialize OpenAI client for Azure
client = OpenAI(
    base_url=AZURE_OPENAI_ENDPOINT,
    api_key=OPENAI_API_KEY,
)

# Database initialization
def init_database():
    conn = sqlite3.connect('solar_analysis.db')
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create analyses table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS analyses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            address TEXT NOT NULL,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            monthly_bill REAL NOT NULL,
            roof_size TEXT,
            panel_type TEXT NOT NULL,
            include_subsidy BOOLEAN NOT NULL,
            analysis_result TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    conn.commit()
    conn.close()

# Initialize database when app starts
init_database()

def get_weather_data(lat, lon):
    """Get actual weather data for solar calculations"""
    try:
        url = f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}&units=metric"
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            # Calculate sun hours based on cloud coverage
            cloud_coverage = data['clouds']['all']
            base_sun_hours = 8  # Maximum daylight hours
            sun_hours = base_sun_hours * (1 - cloud_coverage / 100) * 0.8  # Efficiency factor
            
            return {
                "average_sun_hours": round(max(4, sun_hours), 1),
                "cloud_coverage": cloud_coverage,
                "temperature": data['main']['temp'],
                "humidity": data['main']['humidity'],
                "weather_condition": data['weather'][0]['description'],
                "wind_speed": data['wind']['speed']
            }
        else:
            raise Exception(f"Weather API returned status code: {response.status_code}")
            
    except Exception as e:
        print(f"Weather API error: {e}")
        raise Exception(f"Unable to fetch weather data: {str(e)}")

def calculate_solar_metrics(lat, lon, monthly_bill, roof_size, panel_type, weather_data):
    """Calculate solar metrics using actual weather data"""
    try:
        # Convert monthly bill to actual energy consumption
        avg_tariff_per_kwh = 6.5  # Average electricity tariff in India
        monthly_consumption_kwh = monthly_bill / avg_tariff_per_kwh
        daily_consumption = monthly_consumption_kwh / 30
        annual_consumption = monthly_consumption_kwh * 12
        
        # Use actual sun hours from weather data
        sun_hours = weather_data['average_sun_hours']
        
        # Panel efficiency based on type and weather conditions
        base_efficiency = 0.20 if panel_type == 'premium' else 0.17
        temp_factor = 1 - ((weather_data['temperature'] - 25) * 0.004)  # Temperature derating
        efficiency = base_efficiency * temp_factor
        
        # Calculate required system size
        required_kw = daily_consumption / (sun_hours * efficiency)
        
        # Panel specifications
        panel_wattage = 450 if panel_type == 'premium' else 400
        num_panels = math.ceil((required_kw * 1000) / panel_wattage)
        actual_system_size = (num_panels * panel_wattage) / 1000
        
        # Cost estimation (updated 2024 prices)
        cost_per_kw = 65000 if panel_type == 'premium' else 50000  # INR including installation
        total_cost = actual_system_size * cost_per_kw
        
        # Energy generation calculation
        daily_generation = actual_system_size * sun_hours * efficiency
        annual_generation = daily_generation * 365
        
        # Savings calculation
        annual_savings = min(annual_generation, annual_consumption) * avg_tariff_per_kwh
        payback_period = total_cost / annual_savings if annual_savings > 0 else float('inf')
        
        return {
            "daily_consumption": round(daily_consumption, 2),
            "annual_consumption": round(annual_consumption, 2),
            "required_system_size_kw": round(actual_system_size, 2),
            "number_of_panels": num_panels,
            "estimated_cost": round(total_cost, 2),
            "annual_generation": round(annual_generation, 2),
            "annual_savings": round(annual_savings, 2),
            "payback_period_years": round(payback_period, 1) if payback_period != float('inf') else None,
            "co2_reduction_kg_per_year": round(annual_generation * 0.82, 2),
            "system_efficiency": round(efficiency * 100, 1),
            "capacity_utilization": round((annual_generation / (actual_system_size * 365 * 24)) * 100, 1)
        }
    except Exception as e:
        print(f"Calculation error: {e}")
        raise Exception(f"Failed to calculate solar metrics: {str(e)}")

def analyze_with_openai(location_data, energy_data, solar_metrics, weather_data):
    """Use Azure OpenAI to provide completely dynamic analysis with NO fallback data"""
    try:
        # Extract state/region from address for location-specific data
        address_lower = location_data['address'].lower()
        detected_state = "India"
        if "mumbai" in address_lower or "pune" in address_lower or "maharashtra" in address_lower:
            detected_state = "Maharashtra"
        elif "bangalore" in address_lower or "bengaluru" in address_lower or "karnataka" in address_lower:
            detected_state = "Karnataka"
        elif "chennai" in address_lower or "tamil nadu" in address_lower:
            detected_state = "Tamil Nadu"
        elif "delhi" in address_lower or "new delhi" in address_lower:
            detected_state = "Delhi"
        elif "hyderabad" in address_lower or "telangana" in address_lower:
            detected_state = "Telangana"
        elif "ahmedabad" in address_lower or "gujarat" in address_lower:
            detected_state = "Gujarat"
        
        # Create completely dynamic prompt
        prompt = f"""
        You are a solar energy expert. Generate a UNIQUE analysis for this specific location and system. Use actual data provided and make vendors completely different each time.

        LOCATION: {location_data['address']}
        STATE: {detected_state}
        COORDINATES: {location_data['latitude']}, {location_data['longitude']}

        SYSTEM DATA:
        - Monthly Bill: ₹{energy_data['monthly_bill']}
        - System Size: {solar_metrics['required_system_size_kw']} kW
        - Panels: {solar_metrics['number_of_panels']} 
        - Cost: ₹{solar_metrics['estimated_cost']}
        - Annual Savings: ₹{solar_metrics['annual_savings']}
        - Payback: {solar_metrics['payback_period_years']} years

        WEATHER:
        - Sun Hours: {weather_data['average_sun_hours']}/day
        - Temperature: {weather_data['temperature']}°C
        - Condition: {weather_data['weather_condition']}

        Generate COMPLETELY UNIQUE data. Return ONLY JSON:

        {{
            "suitability_assessment": {{
                "overall_score": [Generate score 60-95 based on payback period and weather],
                "factors": [
                    "Generate 4 SPECIFIC factors using actual weather: {weather_data['weather_condition']}",
                    "Reference actual sun hours: {weather_data['average_sun_hours']}",
                    "Reference payback period: {solar_metrics['payback_period_years']} years",
                    "Location-specific factor for {detected_state}"
                ]
            }},
            "financial_analysis": {{
                "roi_percentage": [Calculate exact: {solar_metrics['annual_savings']}/{solar_metrics['estimated_cost']}*100],
                "break_even_years": {solar_metrics['payback_period_years']},
                "total_savings_25_years": [Calculate: {solar_metrics['annual_savings']} * 25 - {solar_metrics['estimated_cost']}],
                "investment_grade": "[Excellent if <7yr, Good if <12yr, Moderate if <18yr]"
            }},
            "technical_recommendations": [
                "Generate 5 UNIQUE recommendations for {solar_metrics['required_system_size_kw']} kW system",
                "Include orientation advice for lat {location_data['latitude']}",
                "Weather-specific advice for {weather_data['weather_condition']}",
                "Maintenance for {detected_state} climate",
                "Monitoring for {solar_metrics['number_of_panels']} panels"
            ],
            "environmental_impact": {{
                "co2_reduction_tons": {round(solar_metrics['co2_reduction_kg_per_year']/1000, 2)},
                "equivalent_trees": {round(solar_metrics['co2_reduction_kg_per_year']/21.77)},
                "clean_energy_percentage": [Calculate: 75 + (sun_hours-4)*3, max 95]
            }},
            "local_vendors": [
                {{
                    "name": "[Create UNIQUE vendor name for {detected_state} - not generic]",
                    "rating": [Random 4.1-4.8],
                    "experience_years": [Random 5-15], 
                    "specialization": "[Unique: Residential Solar/Commercial/Premium/Rooftop etc]",
                    "contact": "+91-[Generate different 10-digit number each time]",
                    "estimated_quote": "₹{round(solar_metrics['estimated_cost']/100000*0.9, 1)}-{round(solar_metrics['estimated_cost']/100000*1.1, 1)} lakhs",
                    "certifications": ["MNRE Approved", "[Add 1-2 {detected_state}-specific certs]"]
                }},
                {{
                    "name": "[DIFFERENT unique vendor name for {detected_state}]",
                    "rating": [Different rating 4.0-4.7],
                    "experience_years": [Different years 6-20],
                    "specialization": "[Different specialization]", 
                    "contact": "+91-[DIFFERENT 10-digit number]",
                    "estimated_quote": "₹{round(solar_metrics['estimated_cost']/100000*1.05, 1)}-{round(solar_metrics['estimated_cost']/100000*1.15, 1)} lakhs",
                    "certifications": ["MNRE Approved", "[Different certifications]"]
                }},
                {{
                    "name": "[THIRD unique vendor name for {detected_state}]", 
                    "rating": [Third rating 4.2-4.9],
                    "experience_years": [Third years 8-25],
                    "specialization": "[Third specialization type]",
                    "contact": "+91-[THIRD different 10-digit number]",
                    "estimated_quote": "₹{round(solar_metrics['estimated_cost']/100000*0.95, 1)}-{round(solar_metrics['estimated_cost']/100000*1.05, 1)} lakhs",
                    "certifications": ["MNRE Approved", "[Third set of certs]"]
                }}
            ],
            "government_incentives": {{
                "central_subsidy": {30 if energy_data['include_subsidy'] else 0},
                "state_subsidy": [Maharashtra=10%, Karnataka=8%, Tamil Nadu=12%, Delhi=15%, Gujarat=20%, Telangana=5%, others=0% for {detected_state}],
                "net_metering_available": true,
                "tax_benefits": "[Generate {detected_state}-specific tax benefit description]"
            }},
            "installation_timeline": {{
                "site_survey": "[1-3 days for {detected_state}]",
                "approvals": "[10-45 days based on {detected_state} regulations]",
                "installation": "[2-8 days for {solar_metrics['number_of_panels']} panels]", 
                "commissioning": "[1-3 days based on system size]"
            }}
        }}

        CRITICAL: Make vendor names sound realistic for {detected_state}. Generate different phone numbers. All values must be unique for this analysis.
        """
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": f"You are a solar expert for {detected_state}. Generate realistic, unique data for each analysis. Return ONLY valid JSON with no markdown formatting."
                },
                {
                    "role": "user", 
                    "content": prompt
                }
            ],
            max_tokens=3000,
            temperature=0.9  # High temperature for maximum variation
        )
        
        ai_response = response.choices[0].message.content.strip()
        
        # Clean response
        if ai_response.startswith('```'):
            lines = ai_response.split('\n')
            ai_response = '\n'.join(lines[1:-1])
        
        structured_analysis = json.loads(ai_response)
        
        # Validate that we have vendors (required)
        if not structured_analysis.get('local_vendors') or len(structured_analysis['local_vendors']) == 0:
            raise ValueError("AI failed to generate vendors")
        
        return structured_analysis
        
    except Exception as e:
        print(f"AI Analysis Error: {e}")
        # If AI completely fails, fail the analysis - no fallback data
        raise Exception("AI analysis service unavailable. Please try again in a few moments.")

@app.route('/api/analyze', methods=['POST'])
def analyze_solar():
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['address', 'latitude', 'longitude', 'monthlyBill', 'panelType', 'includeSubsidy']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Extract data
        location_data = {
            'address': data['address'],
            'latitude': float(data['latitude']),
            'longitude': float(data['longitude'])
        }
        
        energy_data = {
            'monthly_bill': float(data['monthlyBill']),
            'roof_size': data.get('roofSize', ''),
            'panel_type': data['panelType'],
            'include_subsidy': bool(data['includeSubsidy'])
        }
        
        # Get actual weather data
        weather_data = get_weather_data(location_data['latitude'], location_data['longitude'])
        
        # Calculate solar metrics using real data
        solar_metrics = calculate_solar_metrics(
            location_data['latitude'],
            location_data['longitude'],
            energy_data['monthly_bill'],
            energy_data['roof_size'],
            energy_data['panel_type'],
            weather_data
        )
        
        # Get ONLY AI analysis - no fallbacks
        ai_analysis = analyze_with_openai(location_data, energy_data, solar_metrics, weather_data)
        
        # Store analysis in database
        conn = sqlite3.connect('solar_analysis.db')
        cursor = conn.cursor()
        
        cursor.execute('INSERT INTO users DEFAULT VALUES')
        user_id = cursor.lastrowid
        
        analysis_result = {
            'solar_metrics': solar_metrics,
            'weather_data': weather_data,
            'ai_analysis': ai_analysis,
            'timestamp': datetime.now().isoformat()
        }
        
        cursor.execute('''
            INSERT INTO analyses 
            (user_id, address, latitude, longitude, monthly_bill, roof_size, 
             panel_type, include_subsidy, analysis_result)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            user_id,
            location_data['address'],
            location_data['latitude'],
            location_data['longitude'],
            energy_data['monthly_bill'],
            energy_data['roof_size'],
            energy_data['panel_type'],
            energy_data['include_subsidy'],
            json.dumps(analysis_result)
        ))
        
        analysis_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        # Generate truly dynamic chart data from AI analysis
        annual_savings = solar_metrics['annual_savings']
        estimated_cost = solar_metrics['estimated_cost']
        
        # Use AI's environmental data for chart variation
        clean_energy_pct = ai_analysis.get('environmental_impact', {}).get('clean_energy_percentage', 85)
        variation_factor = clean_energy_pct / 100
        
        chart_years = []
        chart_costs = []
        chart_savings = []
        
        for year in range(1, 6):
            chart_years.append(f"Year {year}")
            chart_costs.append(estimated_cost if year == 1 else 0)
            # Savings vary based on AI's clean energy percentage
            year_savings = annual_savings * min(1.0, (0.5 + (year * 0.1)) * variation_factor)
            chart_savings.append(round(year_savings))
        
        response_data = {
            'success': True,
            'analysis_id': analysis_id,
            'user_id': user_id,
            'location': location_data,
            'energy_profile': energy_data,
            'solar_metrics': solar_metrics,
            'weather_data': weather_data,
            'structured_analysis': ai_analysis,  # Pure AI data
            'chart_data': {
                'cost_vs_savings': {
                    'years': chart_years,
                    'costs': chart_costs,
                    'savings': chart_savings
                },
                'environmental_metrics': {
                    'carbon_reduction': clean_energy_pct,
                    'clean_energy': clean_energy_pct
                }
            },
            'recommendations': {
                'is_suitable': ai_analysis.get('suitability_assessment', {}).get('overall_score', 0) > 70,
                'confidence_score': ai_analysis.get('suitability_assessment', {}).get('overall_score', 75),
                'priority_actions': ai_analysis.get('technical_recommendations', [])
            }
        }
        
        return jsonify(response_data)
        
    except Exception as e:
        print(f"Analysis error: {e}")
        return jsonify({'error': f'Analysis failed: {str(e)}'}), 500

@app.route('/api/analysis/<int:analysis_id>', methods=['GET'])
def get_analysis(analysis_id):
    try:
        conn = sqlite3.connect('solar_analysis.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM analyses WHERE id = ?
        ''', (analysis_id,))
        
        result = cursor.fetchone()
        conn.close()
        
        if not result:
            return jsonify({'error': 'Analysis not found'}), 404
        
        # Parse the stored analysis result
        analysis_data = json.loads(result[9])  # analysis_result column
        
        response = {
            'id': result[0],
            'user_id': result[1],
            'address': result[2],
            'latitude': result[3],
            'longitude': result[4],
            'monthly_bill': result[5],
            'roof_size': result[6],
            'panel_type': result[7],
            'include_subsidy': bool(result[8]),
            'analysis_result': analysis_data,
            'created_at': result[10]
        }
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({'error': f'Failed to retrieve analysis: {str(e)}'}), 500

@app.route('/api/analyses', methods=['GET'])
def get_all_analyses():
    try:
        conn = sqlite3.connect('solar_analysis.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, address, monthly_bill, panel_type, created_at 
            FROM analyses 
            ORDER BY created_at DESC
        ''')
        
        results = cursor.fetchall()
        conn.close()
        
        analyses = []
        for result in results:
            analyses.append({
                'id': result[0],
                'address': result[1],
                'monthly_bill': result[2],
                'panel_type': result[3],
                'created_at': result[4]
            })
        
        return jsonify({'analyses': analyses})
        
    except Exception as e:
        return jsonify({'error': f'Failed to retrieve analyses: {str(e)}'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'openai_api_configured': bool(OPENAI_API_KEY),
        'weather_api_configured': bool(OPENWEATHER_API_KEY),
        'azure_endpoint_configured': bool(AZURE_OPENAI_ENDPOINT)
    })

@app.route('/api/subsidy-info/<state>', methods=['GET'])
def get_subsidy_info(state):
    """Get subsidy information for a specific state"""
    try:
        # Mock subsidy data - replace with real data source
        subsidy_data = {
            'maharashtra': {
                'central_subsidy': 30,  # percentage
                'state_subsidy': 10,
                'max_capacity_kw': 10,
                'application_process': 'Online through MSEDCL portal',
                'processing_time_days': 30
            },
            'default': {
                'central_subsidy': 30,
                'state_subsidy': 0,
                'max_capacity_kw': 10,
                'application_process': 'Contact local electricity board',
                'processing_time_days': 45
            }
        }
        
        state_key = state.lower().replace(' ', '')
        info = subsidy_data.get(state_key, subsidy_data['default'])
        
        return jsonify({
            'state': state,
            'subsidy_info': info,
            'last_updated': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': f'Failed to get subsidy info: {str(e)}'}), 500


# CORS configuration - MUST be after app creation but before routes
CORS(
    app,
    resources={r"/*": {"origins": ["https://solarizeit.netlify.app", "http://localhost:3000"]}},
    supports_credentials=True,
    methods=["GET", "POST", "OPTIONS", "PUT", "DELETE"],
    allow_headers=["Content-Type", "Authorization", "Access-Control-Allow-Credentials"],
    expose_headers=["Content-Type", "Authorization"]
)

PORT = int(os.environ.get("PORT", 5000))

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT, debug=False)
