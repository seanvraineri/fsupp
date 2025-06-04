import os
import json

# Check for API keys
env_vars = {
    'OPENAI_API_KEY': os.getenv('OPENAI_API_KEY', 'Not set'),
    'ANTHROPIC_API_KEY': os.getenv('ANTHROPIC_API_KEY', 'Not set'),
    'CLAUDE_API_KEY': os.getenv('CLAUDE_API_KEY', 'Not set'),
    'SUPABASE_SERVICE_ROLE_KEY': os.getenv('SUPABASE_SERVICE_ROLE_KEY', 'Set' if os.getenv('SUPABASE_SERVICE_ROLE_KEY') else 'Not set')
}

print('Environment Variables:')
for key, value in env_vars.items():
    if 'Not set' not in value and key != 'SUPABASE_SERVICE_ROLE_KEY':
        print(f'  {key}: {value[:10]}...' if len(value) > 10 else f'  {key}: {value}')
    else:
        print(f'  {key}: {value}') 
