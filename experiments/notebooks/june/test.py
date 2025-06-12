import azure.functions as func
import logging

# Define the Azure Function App
app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)
@app.route(route="test_function")
async def test_function(req: func.HttpRequest) -> func.HttpResponse:
    
    """HTTP trigger function to run the agent workflow for insurance quote submission triage."""
    logging.info('Processing a request to run the agent workflow for insurance quote submission triage.')
    
    
    return func.HttpResponse(body = "Agentic Stage 1 complete", status_code = 200)