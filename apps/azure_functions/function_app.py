import azure.functions as func
from process_email_body import process_email_body_impl
from process_pdf_attachment import process_pdf_attachment_impl

# Create ONE FunctionApp instance
app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)

# Register the email processing function
@app.function_name(name="ProcessEmailBody")
@app.route(route="ProcessEmailBody", methods=["POST"])
def process_email_body(req: func.HttpRequest) -> func.HttpResponse:
    return process_email_body_impl(req)

# Register the PDF processing function
@app.function_name(name="ProcessPDFAttachment")
@app.route(route="ProcessPDFAttachment", methods=["POST"])
def process_pdf_attachment(req: func.HttpRequest) -> func.HttpResponse:
    return process_pdf_attachment_impl(req)