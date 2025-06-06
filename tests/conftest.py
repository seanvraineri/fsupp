import os, pytest

# Provide dummy env vars so code under test never errors for missing keys
os.environ.setdefault("SUPABASE_URL", "https://localhost")
os.environ.setdefault("SUPABASE_ANON_KEY", "dummy")
os.environ.setdefault("SUPABASE_SERVICE_ROLE_KEY", "dummy")
os.environ.setdefault("SERPAPI_API_KEY", "dummy")
os.environ.setdefault("OPENAI_API_KEY", "dummy")

# Auto-skip heavy network tests when running in CI/local without real keys
CI_SKIP = os.getenv("CI_SKIP_NETWORK_TESTS", "1") == "1"

@pytest.fixture(autouse=True)
def _skip_network_tests(request):
    if CI_SKIP and request.node.get_closest_marker("network"):
        pytest.skip("Skipping network test (CI_SKIP_NETWORK_TESTS enabled)") 

# Provide dummy env vars so code under test never errors for missing keys
os.environ.setdefault("SUPABASE_URL", "https://localhost")
os.environ.setdefault("SUPABASE_ANON_KEY", "dummy")
os.environ.setdefault("SUPABASE_SERVICE_ROLE_KEY", "dummy")
os.environ.setdefault("SERPAPI_API_KEY", "dummy")
os.environ.setdefault("OPENAI_API_KEY", "dummy")

# Auto-skip heavy network tests when running in CI/local without real keys
CI_SKIP = os.getenv("CI_SKIP_NETWORK_TESTS", "1") == "1"

@pytest.fixture(autouse=True)
def _skip_network_tests(request):
    if CI_SKIP and request.node.get_closest_marker("network"):
        pytest.skip("Skipping network test (CI_SKIP_NETWORK_TESTS enabled)") 