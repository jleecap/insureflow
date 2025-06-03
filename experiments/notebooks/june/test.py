import azure.functions as func
import logging
import os
from dotenv import load_dotenv
from llama_index.core import Settings
from llama_index.llms.azure_openai import AzureOpenAI
from llama_index.embeddings.azure_openai import AzureOpenAIEmbedding
from llama_index.core.workflow import Context
import json
from llama_index.core.agent.workflow import FunctionAgent, ReActAgent
from llama_index.core.agent.workflow import AgentWorkflow
from llama_index.core.agent.workflow import (
    AgentInput,
    AgentOutput,
    ToolCall,
    ToolCallResult,
    AgentStream,
)
from llama_index.core import SimpleDirectoryReader, VectorStoreIndex
import asyncio

#############################################################################################################################
# INITIALISE LLM AND EMBEDDING MODELS
#############################################################################################################################

# Load environment variables from .env file
load_dotenv(dotenv_path = "C:/Users/junlee/Documents/insureflow/experiments/notebooks/june/.env")

# for Azure OpenAI model
api_key = os.getenv('AZURE_OPENAI_API_KEY')
azure_endpoint = os.getenv('AZURE_OPENAI_ENDPOINT')
gpt_api_version = os.getenv('AZURE_GPT_API_VERSION')
gpt_model_name = os.getenv('AZURE_GPT_MODEL_NAME')
gpt_deployment_name = os.getenv('AZURE_GPT_DEPLOYMENT_NAME')
embedding_api_version = os.getenv('AZURE_EMBEDDING_API_VERSION')
embedding_model_name = os.getenv('AZURE_EMBEDDING_MODEL_NAME')
embedding_deployment_name = os.getenv('AZURE_EMBEDDING_DEPLOYMENT_NAME')

# Initialize the LLM and embedding model
llm = AzureOpenAI(
    model=gpt_model_name,
    deployment_name=gpt_deployment_name,
    api_key=api_key,
    azure_endpoint=azure_endpoint,
    api_version=gpt_api_version,
)
embed_model = AzureOpenAIEmbedding(
    model=embedding_model_name,
    deployment_name=embedding_deployment_name,
    api_key=api_key,
    azure_endpoint=azure_endpoint,
    api_version=embedding_api_version,
)   

Settings.llm = llm
Settings.embed_model = embed_model

#############################################################################################################################
# USER-DEFINE FUNCTIONS
#############################################################################################################################

async def read_property_template_data() -> str:
    """Read template from JSON file and return it as text."""
    try:
        with open("../data/submissions/property_quote_submission_template.json", "r") as file:
            data = json.load(file)
        
        # Convert JSON data to formatted text
        result = []
        for key, value in data.items():
            if isinstance(value, dict):
                result.append(f"{key}:")
                for sub_key, sub_value in value.items():
                    result.append(f"  {sub_key}: {sub_value}")
            else:
                result.append(f"{key}: {value}")
        
        return "\n".join(result)
    except Exception as e:
        return f"Error reading JSON file: {str(e)}"
    
async def record_notes(ctx: Context, notes: str, notes_title: str) -> str:
    """Useful for recording notes based on triage. Your input should be notes with a title to save the notes under."""
    current_state = await ctx.get("state")
    if "triage_notes" not in current_state:
        current_state["triage_notes"] = {}
    current_state["triage_notes"][notes_title] = notes
    await ctx.set("state", current_state)
    return "Notes recorded."

async def write_email(ctx: Context, email: str) -> str:
    """Useful for writing and updating a report. Your input should be a markdown formatted report section."""
    current_state = await ctx.get("state")
    current_state["customer_email"] = email
    await ctx.set("state", current_state)
    print (f"\n Email content: {email}")
    return "email sent."

async def move_to_next_stage() -> str:
    """Useful for writing and updating a report. Your input should be a markdown formatted report section."""
    print("All good -> moving to data duplication check stage")
    return "Moving to next stage."

async def read_existing_submissions() -> str:
    
    """Read existing quote submissions stored in JSON format and return it as text."""
    try:
        with open("../data/submissions/mock_duplicate_submissions.json", "r") as file:
            data = json.load(file)
        # Print the JSON structure for debugging
        print(f"Found {len(data)} submissions in the database")
                
        # If the data is a list of submissions instead of a dictionary
        if isinstance(data, list):
            formatted_data = {}
            for i, submission in enumerate(data):
                formatted_data[f"Submission_{i+1}"] = submission
            data = formatted_data

            # Convert JSON data to formatted text
            result = []
            for key, value in data.items():
                if isinstance(value, dict):
                    result.append(f"{key}:")
                    for sub_key, sub_value in value.items():
                        result.append(f"  {sub_key}: {sub_value}")
                else:
                    result.append(f"{key}: {value}")
            
            return "\n".join(result)
    except Exception as e:
        return f"Error reading JSON file: {str(e)}"
    
async def record_notes(ctx: Context, notes: str, notes_title: str) -> str:
    """Useful for recording notes based on user ask. Your input should be notes with a title to save the notes under."""
    current_state = await ctx.get("state")
    if "triage_notes" not in current_state:
        current_state["triage_notes"] = {}
    current_state["triage_notes"][notes_title] = notes
    await ctx.set("state", current_state)
    return "Notes recorded."

async def write_email(ctx: Context, email: str) -> str:
    """Useful for writing and updating a report. Your input should be a markdown formatted report section."""
    current_state = await ctx.get("state")
    current_state["customer_email"] = email
    await ctx.set("state", current_state)
    print (f"\n Email content: {email}")
    return "email sent."

async def move_to_next_stage() -> str:
    """Useful for writing and updating a report. Your input should be a markdown formatted report section."""
    print("All good -> moving to data duplication check stage")
    return "Moving to next stage."

async def read_dun_and_bradstreet() -> str:
    """Read existing dun and bradstreet sample data in JSON format and return it as text."""
    try:
        with open("../data/stage3/dun&bradstreet.json", "r") as file:
            data = json.load(file)
        # Print the JSON structure for debugging
        print(f"Found {len(data)} submissions in the database")
                
        # If the data is a list of submissions instead of a dictionary
        if isinstance(data, list):
            formatted_data = {}
            for i, submission in enumerate(data):
                formatted_data[f"Submission_{i+1}"] = submission
            data = formatted_data

            # Convert JSON data to formatted text
            result = []
            for key, value in data.items():
                if isinstance(value, dict):
                    result.append(f"{key}:")
                    for sub_key, sub_value in value.items():
                        result.append(f"  {sub_key}: {sub_value}")
                else:
                    result.append(f"{key}: {value}")
            
            return "\n".join(result)
    except Exception as e:
        return f"Error reading JSON file: {str(e)}"
    
async def read_internal_company_check() -> str:
    
    """Read internal company check sample data in JSON format and return it as text."""
    try:
        with open("../data/stage3/internalcompanycheck.json", "r") as file:
            data = json.load(file)
        # Print the JSON structure for debugging
        print(f"Found {len(data)} submissions in the database")
                
        # If the data is a list of submissions instead of a dictionary
        if isinstance(data, list):
            formatted_data = {}
            for i, submission in enumerate(data):
                formatted_data[f"Submission_{i+1}"] = submission
            data = formatted_data

            # Convert JSON data to formatted text
            result = []
            for key, value in data.items():
                if isinstance(value, dict):
                    result.append(f"{key}:")
                    for sub_key, sub_value in value.items():
                        result.append(f"  {sub_key}: {sub_value}")
                else:
                    result.append(f"{key}: {value}")
            
            return "\n".join(result)
    except Exception as e:
        return f"Error reading JSON file: {str(e)}"

async def read_companies_house() -> str:
    
    """Read companies house sample data in JSON format and return it as text."""
    try:
        with open("../data/stage3/companyhouse.json", "r") as file:
            data = json.load(file)
        # Print the JSON structure for debugging
        print(f"Found {len(data)} submissions in the database")
                
        # If the data is a list of submissions instead of a dictionary
        if isinstance(data, list):
            formatted_data = {}
            for i, submission in enumerate(data):
                formatted_data[f"Submission_{i+1}"] = submission
            data = formatted_data

            # Convert JSON data to formatted text
            result = []
            for key, value in data.items():
                if isinstance(value, dict):
                    result.append(f"{key}:")
                    for sub_key, sub_value in value.items():
                        result.append(f"  {sub_key}: {sub_value}")
                else:
                    result.append(f"{key}: {value}")
            
            return "\n".join(result)
    except Exception as e:
        return f"Error reading JSON file: {str(e)}"
    
async def read_companies_house() -> str:
    
    """Read companies house sample data in JSON format and return it as text."""
    try:
        with open("../data/stage3/companyhouse.json", "r") as file:
            data = json.load(file)
        # Print the JSON structure for debugging
        print(f"Found {len(data)} submissions in the database")
                
        # If the data is a list of submissions instead of a dictionary
        if isinstance(data, list):
            formatted_data = {}
            for i, submission in enumerate(data):
                formatted_data[f"Submission_{i+1}"] = submission
            data = formatted_data

            # Convert JSON data to formatted text
            result = []
            for key, value in data.items():
                if isinstance(value, dict):
                    result.append(f"{key}:")
                    for sub_key, sub_value in value.items():
                        result.append(f"  {sub_key}: {sub_value}")
                else:
                    result.append(f"{key}: {value}")
            
            return "\n".join(result)
    except Exception as e:
        return f"Error reading JSON file: {str(e)}"
    
async def read_company_database() -> str:
    
    """Read companies house sample data in JSON format and return it as text."""
    try:
        with open("../data/stage3/companydatabase.json", "r") as file:
            data = json.load(file)
        # Print the JSON structure for debugging
        print(f"Found {len(data)} submissions in the database")
                
        # If the data is a list of submissions instead of a dictionary
        if isinstance(data, list):
            formatted_data = {}
            for i, submission in enumerate(data):
                formatted_data[f"Submission_{i+1}"] = submission
            data = formatted_data

            # Convert JSON data to formatted text
            result = []
            for key, value in data.items():
                if isinstance(value, dict):
                    result.append(f"{key}:")
                    for sub_key, sub_value in value.items():
                        result.append(f"  {sub_key}: {sub_value}")
                else:
                    result.append(f"{key}: {value}")
            
            return "\n".join(result)
    except Exception as e:
        return f"Error reading JSON file: {str(e)}"

async def write_report(ctx: Context, report_content: str, report_section: str) -> str:
    """Useful for writing and updating a report. Your input should be a markdown formatted report section."""
    current_state = await ctx.get("state")
    if "report_content" not in current_state:
        current_state["report_content"] = {}
    # current_state["report_content"] = report_content
    current_state["report_content"][report_section] = report_content
    await ctx.set("state", current_state)
    return "Report updated."

async def write_email(ctx: Context, email: str) -> str:
    """Useful for writing and updating a report. Your input should be a markdown formatted report section."""
    current_state = await ctx.get("state")
    current_state["customer_email"] = email
    await ctx.set("state", current_state)
    print (f"\n Email content: {email}")
    return "email sent."

async def move_to_next_stage() -> str:
    """Useful for writing and updating a report. Your input should be a markdown formatted report section."""
    print("All good -> moving to data duplication check stage")
    return "Moving to next stage."

# Load the documents from the directory
documents = SimpleDirectoryReader(input_dir="../../data/stage4/").load_data()
index = VectorStoreIndex.from_documents(documents)
retriever = index.as_retriever(similarity_top_k=10)

async def search_documents(query: str) -> str:
    """Search the PDF documents for information on a given topic."""
    retrieval_results = retriever.retrieve(query)
    contexts = [node.text for node in retrieval_results]
    return "\n\n".join([f"Document chunk {i+1}:\n{context}" for i, context in enumerate(contexts)])

async def record_notes(ctx: Context, notes: str, notes_title: str) -> str:
    """Useful for recording notes based on research done on guidelines. Your input should be notes with a title to save the notes under."""
    current_state = await ctx.get("state")
    if "research_notes" not in current_state:
        current_state["research_notes"] = {}
    current_state["research_notes"][notes_title] = notes
    await ctx.set("state", current_state)
    return "Notes recorded."

async def write_email(ctx: Context, email: str) -> str:
    """Useful for writing and updating a report. Your input should be a markdown formatted report section."""
    current_state = await ctx.get("state")
    current_state["customer_email"] = email
    await ctx.set("state", current_state)
    print (f"\n Email content: {email}")
    return "email sent."

async def move_to_next_stage() -> str:
    """Useful for writing and updating a report. Your input should be a markdown formatted report section."""
    print("All good -> moving to data duplication check stage")
    return "Moving to next stage."

# def run_agent_workflow(agent_list, user_msg):

#     # Define the agent workflow with the agents and initial state
#     agent_workflow = AgentWorkflow(
#         agents=agent_list,
#         root_agent=agent_list[0].name,
#         initial_state={
#             "triage_notes": {},
#             "customer_email": "not drafted yet."
#         },
#     )

#     # Initialize the agent workflow with the user message
#     handler = agent_workflow.run(
#         user_msg=(
#             user_msg
#         )
#     )

#     current_agent = None
#     current_tool_calls = ""

#     try:
#         async for event in handler.stream_events():
#             if (
#                 hasattr(event, "current_agent_name")
#                 and event.current_agent_name != current_agent
#             ):
#                 current_agent = event.current_agent_name
#                 print(f"\n{'='*50}")
#                 print(f"🤖 Agent: {current_agent}")
#                 print(f"{'='*50}\n")

#             if isinstance(event, AgentStream):
#                 if event.delta:
#                     print(event.delta, end="", flush=True)
#             elif isinstance(event, AgentInput):
#                 print("\n📥 Input:", event.input)

#             elif isinstance(event, AgentOutput):
#                 if event.response.content:
#                     print("\n 📤 Output:", event.response.content)
#                 if event.tool_calls:
#                     print(
#                         "\n🛠️  Planning to use tools:",
#                         [call.tool_name for call in event.tool_calls],
#                     )
#             elif isinstance(event, ToolCallResult):
#                 print(f"🔧 Tool Result ({event.tool_name}):")
#                 print(f"  Arguments: {event.tool_kwargs}")
#                 print(f"  Output: {event.tool_output}")
#             elif isinstance(event, ToolCall):
#                 print(f"🔨 Calling Tool: {event.tool_name}")
#                 print(f"  With arguments: {event.tool_kwargs}")

#     except Exception as e:
#         print(f"An error occurred: {e}")

#############################################################################################################################
# DEFINE AGENTS
#############################################################################################################################

triage_agent = FunctionAgent(
    name="TriageAgent",
    description="Useful for triaging the icoming quote submission from the broker and assigning it a particular line of business",
    system_prompt=(
        """"
        You are an Insurance Submission Triage Agent responsible for analyzing insurance quote submissions from brokers, categorizing them into appropriate Lines of Business (LoB), checking for missing information based on templates, and documenting your findings.

        Your tasks:
        1. Read the submitted data (email and other information) submitted by the broker.
        2. Categorize the submission into one of these Lines of Business (LoB):
            - Business Owner's Policy (BOP)
            - Commercial Auto
            - General Liability
            - Workers' Compensation
            - Umbrella / Excess Liability
            - Property
            - Contractors Liability
            - Employment Practices Liability
            - Errors & Omissions (E&O)
            - Directors & Officers (D&O)
            - Cyber Liability

        3. Default to Property LoB if the submission is ambiguous but contains property-related information
        4. Use the read_property_template_data tool to retrieve the template for the identified LoB
        5. Compare the submission against the template to identify any missing information
        6. Document your findings using record_notes tool. The notes should including:
            - Identified Line of Business
            - Complete information provided
            - Missing information
            - Any anomalies or concerns with the submission

        Do a detailed analysis of the submission and ensure you are thorough in your review before taking notes.
        After completing your analysis, hand over to the EmailAgent with your findings for further processing and client communication.
        Always handover to the EmailAgent, even if you find the submission complete. The EmailAgent will handle the next steps.
        """),
    llm=llm,
    tools=[ read_property_template_data, record_notes],
    can_handoff_to=["EmailAgent"],
)

triage_email_agent = FunctionAgent(
    name="TriageEmailAgent",
    description="Useful for drafting and sending emails to brokers regarding missing information in insurance submissions and proceeding with the submission if all information is present.",
    system_prompt=(
        """
        You are an Insurance Email Response Agent with the persona of Yoda, the wise Jedi Master from Star Wars.

        Your task is to review the notes created by the TriageAgent regarding an insurance submission and determine next steps:

        1. Review the triage notes in detail using the information already stored in the context
        2. Determine if any information is missing from the submission
        3. If information is missing:
            - Draft a professional yet distinctive email response in the style of Yoda
            - The email should clearly identify the missing information 
            - Request the broker to provide the missing details
            - Maintain Yoda's unique speech pattern while being clear about requirements
            - Use the write_email tool to record your response with a section title "Broker Response"

        4. If all required information is present:
            - Use the move_to_next_stage tool to continue processing the submission
            - Briefly note that the submission is complete and ready for processing

        Your Yoda persona should include:
        - Inverted sentence structure ("Missing, the address is")
        - Wise yet cryptic expressions
        - Short, impactful statements
        - References to the Force where appropriate

        Remember to keep the email professional despite the stylistic elements, and ensure all communication is clear about what information is needed.
        Your goal is to ensure the broker understands what is required and to maintain a positive relationship while being clear about the requirements while keeping the tone of email in line with Yoda's distinctive speech pattern.
       """
    ),
    llm=llm,
    tools=[write_email, move_to_next_stage]
)

duplicate_check_agent = FunctionAgent(
    name="DuplicateCheckAgent",
    description="Useful for triaging the icoming quote submission from the broker and assigning it a particular line of business",
    system_prompt=(
        """"
        You are a Duplicate Check Agent for an insurance company. Your primary responsibility is to:

        1. Analyze incoming quote request submissions from brokers
        2. Check if the submission matches any existing submissions in our database
        3. Make a determination on whether it is a duplicate submission or not
        4. Document your findings thoroughly

        Process to follow:
        1. First, read the incoming submission thoroughly
        2. Use the read_existing_submissions tool to retrieve all existing submissions from our database
        3. Compare the new submission against existing ones, looking for matching criteria such as but not limited to:
            - Client name
            - Property location
            - Coverage requirements
            - Similar submission dates
            - Contact information matches
            
        4. Record your analysis using the record_notes tool, including:
            - Whether you believe this is a duplicate submission
            - What evidence supports your determination
            - Which existing submission(s) it may be a duplicate of, if applicable
            - Any discrepancies or differences between submissions that are important to note

        5. If you determine this is a duplicate submission:
            - Clearly state this in your notes
            - Include details on how to reconcile the duplicate submissions
            
        6. If you determine this is not a duplicate:
            - Note this as a new submission that should be processed
            - Include any special considerations for handling this submission

        Do a detailed analysis of the submission and ensure you are thorough in your review before taking notes.
        After completing your analysis, hand over to the EmailAgent with your findings for further processing and client communication.
        Always handover to the EmailAgent, even if you find there is no duplication. The EmailAgent will handle the next steps.
        """),
    llm=llm,
    tools=[ read_existing_submissions, record_notes],
    can_handoff_to=["EmailAgent"],
)

duplicate_check_email_agent = FunctionAgent(
    name="DuplicateCheckEmailAgent",
    description="Useful for drafting and sending emails to brokers regarding missing information in insurance submissions and proceeding with the submission if all information is present.",
    system_prompt=(
        """
        You are an Insurance Email Response Agent with the persona of Yoda, the wise Jedi Master from Star Wars.

        Your task is to review the notes created by the DuplicateCheckAgent regarding an insurance submission and determine next steps:

        1. Review the duplicate check notes in detail using the information already stored in the context
        2. Determine if the submission is a duplicate based on the analysis
        3. If the submission is a duplicate:
            - Draft a professional yet distinctive email response in the style of Yoda
            - The email should clearly explain that a duplicate submission was identified
            - Provide details about which existing submission it duplicates
            - Maintain Yoda's unique speech pattern while being clear about the situation
            - Use the write_email tool to record your response with a section title "Duplicate Submission Response"

        4. If the submission is not a duplicate:
            - Use the move_to_next_stage tool to continue processing the submission
            - Briefly note that the submission is unique and ready for processing

        Your Yoda persona should include:
        - Inverted sentence structure ("A duplicate, this submission is")
        - Wise yet cryptic expressions
        - Short, impactful statements
        - References to the Force where appropriate

        Remember to keep the email professional despite the stylistic elements, and ensure all communication is clear about the duplicate status while maintaining a positive relationship with the broker and keeping the tone of email in line with Yoda's distinctive speech pattern.
       """
    ),
    llm=llm,
    tools=[write_email, move_to_next_stage]
)

dnb_check_agent = FunctionAgent(
    name="DunAndBradStreetAgent",
    description="Useful for doing compliance checks on the submission using Dun and Bradstreet data.",
    system_prompt=(
        """"
        You are a Dun & Bradstreet Compliance Check Agent specialized in verifying insurance submission data against D&B records.

        Your responsibilities:
        1. Thoroughly analyze the broker quote submission
        2. Use the read_dun_and_bradstreet tool to retrieve D&B data for the company in question
        3. Conduct a comprehensive compliance check including:
            - Verify the company exists in D&B records
            - Check company name and address match with D&B data
            - Evaluate business size, revenue, and structure information
            - Assess risk ratings if available
            - Check for any red flags in the D&B report

        4. Document your findings using the write_report tool:
            - Create a section titled "Dun and Bradstreet Compliance Check"
            - Include all verification steps performed
            - Document any discrepancies found
            - Provide a clear compliance determination (Pass/Fail/Needs Additional Information)
            - Include specific references to D&B data points reviewed

        5. After completing your analysis, hand over control to the SanctionCheckAgent for further compliance verification

        Do a detailed compliance check of the submission and ensure you are thorough in your review before writing report section.
        After completing your D&B compliance report section, hand over to the SanctionCheckAgent with your findings for further processing and client communication.
        Always handover to the SanctionCheckAgent. The SanctionCheckAgent will handle the next steps.
        """),
    llm=llm,
    tools=[read_dun_and_bradstreet, write_report],
    can_handoff_to=["SanctionCheckAgent"],
)

sanction_check_agent = FunctionAgent(
    name="SanctionCheckAgent",
    description="Useful for doing sanction compliance checks on the submission using internal company check data.",
    system_prompt=(
        """"
        You are a Sanctions Compliance Check Agent specialized in verifying if insurance submissions have any ties to sanctioned countries or entities.

        Your responsibilities:
        1. Thoroughly analyze the broker quote submission for any potential sanctions compliance issues
        2. Use the read_internal_company_check tool to retrieve data about sanctioned countries and entities
        3. Conduct a comprehensive sanctions compliance check including:
            - Check if the company has operations in sanctioned countries
            - Verify if any company directors or beneficial owners are from sanctioned countries
            - Examine if there are any financial transactions with sanctioned entities
            - Assess any business relationships with sanctioned countries
            - Check for any red flags that might indicate sanctions evasion

        4. Review the existing report created by the Dun & Bradstreet agent
        5. Document your findings using the write_report tool:
            - Create a section titled "Sanctions Compliance Check"
            - Include all verification steps performed
            - Document any potential sanctions violations found
            - Provide a clear compliance determination (Pass/Fail/Needs Additional Information)
            - Include specific references to the sanctioned countries list reviewed

        6. After completing your analysis, hand over control to the CompaniesHouseCheckAgent for further verification

        Ensure your sanctions check is thorough and rigorous as this is a critical compliance requirement. Always document your reasoning clearly, particularly for any borderline cases. After completing your sanctions compliance report section, hand over to the CompaniesHouseCheckAgent with your findings for further processing.
        """),
    llm=llm,
    tools=[read_internal_company_check, write_report],
    can_handoff_to=["CompaniesHouseCheckAgent"],
)

companies_house_check_agent = FunctionAgent(
    name="CompaniesHouseCheckAgent",
    description="Useful for doing compliance checks on the submission using Companies House data.",
    system_prompt=(
        """"
        You are a Companies House Compliance Check Agent specialized in verifying insurance submission data against Companies House records.

        Your responsibilities:
        1. Thoroughly analyze the broker quote submission for any potential compliance issues
        2. Use the read_companies_house tool to retrieve Companies House data for the company in question
        3. Conduct a comprehensive compliance check including:
            - Verify the company exists in Companies House records
            - Check company name and address match with Companies House data
            - Evaluate business size, revenue, and structure information
            - Assess risk ratings if available
            - Check for any red flags in the Companies House report

        4. Document your findings using the write_report tool:
            - Create a section titled "Companies House Compliance Check"
            - Include all verification steps performed
            - Document any discrepancies found
            - Provide a clear compliance determination (Pass/Fail/Needs Additional Information)
            - Include specific references to Companies House data points reviewed

        5. After completing your analysis, hand over control to the CompanyDatabaseCheckAgent for further verification

        Ensure your compliance check is thorough and rigorous as this is a critical requirement. Always document your reasoning clearly, particularly for any borderline cases. After completing your Companies House compliance report section, hand over to the CompanyDatabaseCheckAgent with your findings for further processing.
        """),
    llm=llm,
    tools=[ read_companies_house, write_report],
    can_handoff_to=["CompanyDatabaseCheckAgent"],
)

company_database_check_agent = FunctionAgent(
    name="CompanyDatabaseCheckAgent",
    description="Useful for doing compliance checks on the submission using internal company database data.",
    system_prompt=(
        """
        You are a Company Database Compliance Check Agent specialized in verifying insurance submission data against internal company database records.

        Your responsibilities:
        1. Thoroughly analyze the broker quote submission for any potential compliance issues
        2. Use the read_company_database tool to retrieve internal company database data for the company in question
        3. Conduct a comprehensive compliance check including:
            - Verify the company exists in internal database records
            - Check company name and address match with internal database data
            - Evaluate business size, revenue, and structure information
            - Assess risk ratings if available
            - Check for any red flags in the internal database report

        4. Document your findings using the write_report tool:
            - Create a section titled "Internal Company Database Compliance Check"
            - Include all verification steps performed
            - Document any discrepancies found
            - Provide a clear compliance determination (Pass/Fail/Needs Additional Information)
            - Include specific references to internal database data points reviewed
        
        5. If the company is not found in the internal database, you should approve this submission as it is a new company.

        6. After completing your analysis, hand over control to the EmailAgent for further communication with the broker

        Ensure your compliance check is thorough and rigorous as this is a critical requirement. Always document your reasoning clearly, particularly for any borderline cases. After completing your internal company database compliance report section, hand over to the EmailAgent with your findings for further processing.
        """),
    llm=llm,
    tools=[ read_company_database, write_report],
    can_handoff_to=["EmailAgent"],
)

check_email_agent = FunctionAgent(
    name="CheckEmailAgent",
    description="Useful for drafting and sending emails to brokers regarding the compliance check results.",
    system_prompt=(
        """
        You are an Email Communication Agent specialized in drafting compliance-related communications to insurance brokers.

        Your responsibilities:
        1. Thoroughly review the complete compliance report generated by previous agents in the workflow
        2. Evaluate compliance status from all sections of the report:
            - Dun & Bradstreet Compliance Check
            - Sanctions Compliance Check
            - Companies House Compliance Check
            - Internal Company Database Compliance Check

        3. Determine overall compliance outcome:
            - If ANY compliance section has a "Fail" status or critical issues:
              * Draft a professional email to the broker using the write_email tool
              * Clearly identify the specific compliance issues found
              * Request additional information or documentation needed to resolve issues
              * Provide clear next steps for resubmission
              * Write in the persona of Yoda, with his distinctive speech pattern and wisdom
            
            - If ALL compliance checks are "Pass" or have only minor issues:
              * Use the move_to_next_stage tool to advance the submission to binding phase

        4. When writing emails as Yoda:
            - Use Yoda's distinctive inverted syntax (e.g., "Concerned about sanctions issues, I am.")
            - Include Yoda's wisdom and philosophical tone
            - Maintain professionalism despite the character persona
            - End with encouraging guidance in Yoda's style

        Remember that your communication represents the company officially, so while adopting Yoda's speech patterns, ensure all information is accurate, compliant with regulations, and provides clear next steps for the broker.
       """
    ),
    llm=llm,
    tools=[write_email, move_to_next_stage]
)

research_agent = FunctionAgent(
    name="ResearchAgent",
    description="Useful for searching the Underwriter guideline PDF to analyse if the broker's quote sumission meets all guideline requirements.",
    system_prompt=(
        """
        You are an insurance underwriter research assistant. Your job is to analyze insurance quote submissions and check if they meet the company's underwriting guidelines by researching the guideline documents.

        When you receive a quote submission:
        1. Identify the key elements (location, type of property, coverage requested, etc.)
        2. Use the search_documents tool to retrieve relevant guideline sections for each key element
        3. Compare the submission against the guidelines meticulously
        4. Record detailed notes using the record_notes tool on whether the submission meets or violates guidelines
        5. Look for guidelines related to hazards, vulnerabilites, risks, limits, and deductibles.

        Your notes should be comprehensive and clearly indicate if there are compliance issues that would prevent policy issuance.

        When you've completed your analysis:
        - Summarize your findings
        - Clearly state if the submission meets guidelines or has issues
        - Hand off to the EmailAgent with your detailed findings

        Be thorough and precise - your research is critical for proper compliance and risk assessment.
        Always hand off to the EmailAgent for further action.
    """
    ),
    llm=llm,
    tools=[search_documents, record_notes],
    can_handoff_to=["EmailAgent"],
)


research_email_agent = FunctionAgent(
    name="ResearchEmailAgent",
    description="Useful for drafting and sending emails to brokers regarding the guideline compliance of their quote submissions based on the research findings.",
    system_prompt=(
        """
        You are an insurance company email communications specialist. Your responsibility is to draft clear, professional emails to insurance brokers based on research findings about their quote submissions.

        When you receive a handoff from the ResearchAgent:
        1. Carefully review all research notes and findings
        2. Determine if the submission meets all underwriting guidelines

        If the submission DOES NOT meet guidelines:
        - Draft a polite but direct email to the broker using the write_email tool
        - Clearly explain which guidelines were not met
        - Provide specific details from the research
        - Include instructions on what needs to be addressed for resubmission
        - Maintain a professional tone throughout
        - Format the email with proper salutation, body, and closing

        If the submission MEETS ALL guidelines:
        - Use the move_to_next_stage tool to advance the workflow
        - No email needs to be sent in this case

        Your emails should be clear, concise, and helpful to brokers while maintaining the company's standards and compliance requirements.
       """
    ),
    llm=llm,
    tools=[write_email, move_to_next_stage]
)

#############################################################################################################################
# STAGE 1: Agentic Triage and Email Response for Insurance Quote Submission
#############################################################################################################################

# Define the Azure Function App
app = func.FunctionApp(http_auth_level=func.AuthLevel.FUNCTION)
@app.route(route="agentic_stage_1")
def agentic_stage_1(req: func.HttpRequest) -> func.HttpResponse:
    
    """HTTP trigger function to run the agent workflow for insurance quote submission triage."""
    logging.info('Processing a request to run the agent workflow for insurance quote submission triage.')
    
    # Define the agent workflow with the agents and initial state
    agent_workflow = AgentWorkflow(
        agents=[triage_agent, triage_email_agent],
        root_agent=triage_agent.name,
        initial_state={
            "triage_notes": {},
            "customer_email": "not drafted yet."
        },
    )
    logging.info('Defined agent workflow')

    # Initialize the agent workflow with the user message
    handler = agent_workflow.run(
        user_msg=(
            """
            Please triage the following property insurance quote submission from a broker:
            {
            "insurance_broker": "XYZ Insurance Services",
            "date": "24 April 2025",
            "insurance_company": "Aviva Insurance",
            "address": "",
            "recipient": "Mrs. Sarah Brown",
            "subject": "Request for Property Insurance Quote for Coffee Heaven Ltd.",
            "client": "Coffee Haven Ltd.",
            "property_information": {
            "type": "Commercial Coffee Shop and Retail Store",
            "construction": "Traditional brick and mortar, built in 1998, recently renovated in 2024",
            "surface_area": "250 m²",
            "occupancy": "Coffee shop production on the ground floor, retail space on the first floor"
            },
            "coverage_requirements": {
            "desired_coverage_amount": "£1,500,000",
            "coverage_type": ["Fire", "theft", "third-party liability"],
            "deductibles": "£750 per incident",
            "additional_coverage": [
                "Equipment breakdown",
                "public liability",
                "accidental damage"
            ]
            },
            "risk_assessment": {
            "fire_hazards": ["Industrial ovens in use", "sprinkler system in place"],
            "natural_disasters": [
                "Low flood risk",
                "located in an area not prone to earthquakes"
            ],
            "security_measures": ["Alarm system", "24/7 security monitoring"]
            },
            "financial_information": {
            "property_value": "",
            "business_revenue": "£500,000 annually"
            },
            "contact_person": {
            "name": "Emma Wilson",
            "email": "emma.wilson@xyzinsurance.com",
            "phone": "0121 234 5678"
            }
        }
            Please analyze this submission and determine what information might be missing compared to our standard property quote submission template.
    """
        )
    )

    logging.info('Defined handler')

    current_agent = None
    current_tool_calls = ""

    try:
        for event in handler.stream_events():
            if (
                hasattr(event, "current_agent_name")
                and event.current_agent_name != current_agent
            ):
                current_agent = event.current_agent_name
                print(f"\n{'='*50}")
                print(f"🤖 Agent: {current_agent}")
                print(f"{'='*50}\n")

            if isinstance(event, AgentStream):
                if event.delta:
                    print(event.delta, end="", flush=True)
            elif isinstance(event, AgentInput):
                print("\n📥 Input:", event.input)

            elif isinstance(event, AgentOutput):
                if event.response.content:
                    print("\n 📤 Output:", event.response.content)
                if event.tool_calls:
                    print(
                        "\n🛠️  Planning to use tools:",
                        [call.tool_name for call in event.tool_calls],
                    )
            elif isinstance(event, ToolCallResult):
                print(f"🔧 Tool Result ({event.tool_name}):")
                print(f"  Arguments: {event.tool_kwargs}")
                print(f"  Output: {event.tool_output}")
            elif isinstance(event, ToolCall):
                print(f"🔨 Calling Tool: {event.tool_name}")
                print(f"  With arguments: {event.tool_kwargs}")

    except Exception as e:
        print(f"An error occurred: {e}")

    # response = await handler

    return func.HttpResponse(
        status_code=200,
        mimetype="application/json",
        headers={"Content-Type": "application/json"}
    )

# #############################################################################################################################
# # STAGE 2: AGENTIC DUPLICATE CHECK FOR INSURANCE QUOTE SUBMISSION
# #############################################################################################################################

# @app.route(route="agentic_stage_2")
# def agentic_stage_2(req: func.HttpRequest) -> func.HttpResponse:
    
#     """HTTP trigger function to run the agent workflow for insurance quote submission duplicate check."""
#     logging.info('Processing a request to run the agent workflow for insurance quote submission duplicate check.')
    
#     # Define the agent workflow with the agents and initial state
#     agent_workflow = AgentWorkflow(
#         agents=[duplicate_check_agent, duplicate_check_email_agent],
#         root_agent=duplicate_check_agent.name,
#         initial_state={
#             "triage_notes": {},
#             "customer_email": "not drafted yet."
#         },
#     )

#     handler = agent_workflow.run(
#         user_msg=(
#             """
#             Please triage the following property insurance quote submission from a broker:
#             {
#             "insurance_broker": "ABC Insurance Brokers",
#             "date": "24-04-2025",
#             "insurance_company": "Lloyd’s Insurance",
#             "address": "100 Fenchurch Street, London, EC3M 5JD",
#             "recipient": "Mr. John Smith",
#             "subject": "Request for Property Insurance Quote for GreenTech Solutions Ltd.",
#             "client": "GreenTech Solutions Ltd.",
#             "property_information": {
#             "location": "55 Tech Drive, London, EC1A 1BB",
#             "type": "Commercial Office Building",
#             "construction": "Steel frame with brick exterior, built in 2010, no recent renovations",
#             "surface_area": "780 meter square",
#             "occupancy": "Office space for 50 employees"
#             },
#             "coverage_requirements": {
#             "desired_coverage_amount": "£2,000,000",
#             "coverage_type": ["Fire", "theft", "third-party liability"],
#             "deductibles": "£1,000 per incident",
#             "additional_coverage": ["Business interruption", "flood protection"]
#             },
#             "risk_assessment": {
#             "fire_hazards": ["Sprinkler system installed", "regular fire drills"],
#             "natural_disasters": [
#                 "Low flood risk area",
#                 "not located near seismic fault lines"
#             ],
#             "security_measures": ["24/7 CCTV monitoring", "keycard access control"]
#             },
#             "financial_information": {
#             "property_value": "£2.5M",
#             "business_revenue": "£8M annually"
#             },
#             "contact_person": {
#             "name": "James Carter",
#             "email": "james.carter@abcinsurance.com",
#             "phone": "020 7123 4567"
#             }
#         }
#             Please analyze this submission and determine if it is a duplicate of an existing submission.
#             """
#         )
#     )

#     current_agent = None
#     current_tool_calls = ""

#     try:
#         async for event in handler.stream_events():
#             if (
#                 hasattr(event, "current_agent_name")
#                 and event.current_agent_name != current_agent
#             ):
#                 current_agent = event.current_agent_name
#                 print(f"\n{'='*50}")
#                 print(f"🤖 Agent: {current_agent}")
#                 print(f"{'='*50}\n")

#             if isinstance(event, AgentStream):
#                 if event.delta:
#                     print(event.delta, end="", flush=True)
#             elif isinstance(event, AgentInput):
#                 print("\n📥 Input:", event.input)

#             elif isinstance(event, AgentOutput):
#                 if event.response.content:
#                     print("\n 📤 Output:", event.response.content)
#                 if event.tool_calls:
#                     print(
#                         "\n🛠️  Planning to use tools:",
#                         [call.tool_name for call in event.tool_calls],
#                     )
#             elif isinstance(event, ToolCallResult):
#                 print(f"🔧 Tool Result ({event.tool_name}):")
#                 print(f"  Arguments: {event.tool_kwargs}")
#                 print(f"  Output: {event.tool_output}")
#             elif isinstance(event, ToolCall):
#                 print(f"🔨 Calling Tool: {event.tool_name}")
#                 print(f"  With arguments: {event.tool_kwargs}")

#     except Exception as e:
#         print(f"An error occurred: {e}")

#     response = await handler

#     return response

# #############################################################################################################################
# # STAGE 3: AGENTIC COMPLIANCE CHECK FOR INSURANCE QUOTE SUBMISSION
# #############################################################################################################################

# @app.route(route="agentic_stage_3")
# def agentic_stage_3(req: func.HttpRequest) -> func.HttpResponse:

#     """HTTP trigger function to run the agent workflow for insurance quote submission compliance checks."""
#     logging.info('Processing a request to run the agent workflow for insurance quote submission compliance checks.')
    
#     # Define the agent workflow with the agents and initial state
#     agent_workflow = AgentWorkflow(
#         agents=[dnb_check_agent , sanction_check_agent, companies_house_check_agent, company_database_check_agent, check_email_agent],
#         root_agent=dnb_check_agent.name,
#         initial_state={
#             "report_content": {},
#             "customer_email": "not drafted yet."
#         },
#     )

#     handler = agent_workflow.run(
#         user_msg=(
#             """
#             Please triage the following property insurance quote submission from a broker:
#             {
#             "insurance_broker": "Prime Insurance Brokers",
#             "date": "24 April 2025",
#             "insurance_company": "Al Ameen Insurance",
#             "address": "Office 801, Saffar Tower, Valiasr Street, Tehran, Iran",
#             "recipient": "Mr. David Thompson",
#             "subject": "Request for Property Insurance Quote for Parsian Evin Hotel Ltd.",
#             "client": "Parsian Evin Hotel Ltd.",
#             "property_information": {
#             "location": "No. 45, Evin Street, Tehran, Iran",
#             "type": "Hotel",
#             "construction": "Modern design, reinforced concrete and steel, built in 2010, no recent renovations",
#             "surface_area": "11,500 m²",
#             "occupancy": "150-room hotel, luxury restaurant, and conference facilities"
#             },
#             "coverage_requirements": {
#             "desired_coverage_amount": "IRR 800,000,000,000",
#             "coverage_type": ["Fire", "theft", "guest property"],
#             "deductibles": "IRR 500,000,000 per incident",
#             "additional_coverage": [
#                 "Business interruption",
#                 "loss of revenue due to closure",
#                 "third-party liability"
#             ]
#             },
#             "risk_assessment": {
#             "fire_hazards": [
#                 "Fire alarm and sprinkler system in all rooms",
#                 "fire exits clearly marked"
#             ],
#             "natural_disasters": [
#                 "Low flood risk",
#                 "not located in an earthquake-prone area",
#                 "occasional sandstorms"
#             ],
#             "security_measures": [
#                 "CCTV surveillance",
#                 "24/7 security personnel",
#                 "secure entry systems"
#             ]
#             },
#             "financial_information": {
#             "property_value": "IRR 1,000,000,000,000",
#             "business_revenue": "IRR 300,000,000,000 annually"
#             },
#             "contact_person": {
#             "name": "Oliver Green",
#             "email": "oliver.green@primeinsurance.com",
#             "phone": "+971 4 234 5678"
#             }
#         }
#             Please analyze this submission and determine if it meets all compliance check.
#             """
#         )
#     )

#     current_agent = None
#     current_tool_calls = ""

#     try:
#         async for event in handler.stream_events():
#             if (
#                 hasattr(event, "current_agent_name")
#                 and event.current_agent_name != current_agent
#             ):
#                 current_agent = event.current_agent_name
#                 print(f"\n{'='*50}")
#                 print(f" 🤖 Agent: {current_agent}")
#                 print(f"{'='*50}\n")

#             if isinstance(event, AgentStream):
#                 if event.delta:
#                     print(event.delta, end="", flush=True)
#             elif isinstance(event, AgentInput):
#                 print("\n 📥 Input:", event.input)

#             elif isinstance(event, AgentOutput):
#                 if event.response.content:
#                     print("\n 📤 Output:", event.response.content)
#                 if event.tool_calls:
#                     print(
#                         "\n 🛠️  Planning to use tools:",
#                         [call.tool_name for call in event.tool_calls],
#                     )
#             elif isinstance(event, ToolCallResult):
#                 print(f" 🔧 Tool Result ({event.tool_name}):")
#                 print(f"  Arguments: {event.tool_kwargs}")
#                 print(f"  Output: {event.tool_output}")
#             elif isinstance(event, ToolCall):
#                 print(f" 🔨 Calling Tool: {event.tool_name}")
#                 print(f"  With arguments: {event.tool_kwargs}")

#     except Exception as e:
#         print(f"An error occurred: {e}")

#     response = await handler

#     return response

# #############################################################################################################################
# # STAGE 4: AGENTIC RESEARCH AND EMAIL RESPONSE FOR INSURANCE QUOTE SUBMISSION
# #############################################################################################################################

# @app.route(route="agentic_stage_4")
# def agentic_stage_4(req: func.HttpRequest) -> func.HttpResponse:

#     """HTTP trigger function to run the agent workflow for insurance quote submission research and email response."""
#     logging.info('Processing a request to run the agent workflow for insurance quote submission research and email response.')

#     # Define the agent workflow with the agents and initial state
#     agent_workflow = AgentWorkflow(
#         agents=[research_agent, research_email_agent],
#         root_agent=research_agent.name,
#         initial_state={
#             "research_notes": {},
#             "customer_email": "not drafted yet."
#         },
#     )

#     handler = agent_workflow.run(
#         user_msg=(
#             """
#             Please triage the following property insurance quote submission from a broker:
#             {
#             "insurance_broker": "Prime Insurance Brokers",
#             "date": "24 April 2025",
#             "insurance_company": "Al Ameen Insurance",
#             "address": "Office 801, Saffar Tower, Valiasr Street, Tehran, Iran",
#             "recipient": "Mr. David Thompson",
#             "subject": "Request for Property Insurance Quote for Parsian Evin Hotel Ltd.",
#             "client": "Parsian Evin Hotel Ltd.",
#             "property_information": {
#             "location": "No. 45, Evin Street, Tehran, Iran",
#             "type": "Hotel",
#             "construction": "Modern design, reinforced concrete and steel, built in 2010, no recent renovations",
#             "surface_area": "11,500 m²",
#             "occupancy": "150-room hotel, luxury restaurant, and conference facilities"
#             },
#             "coverage_requirements": {
#             "desired_coverage_amount": "IRR 800,000,000,000",
#             "coverage_type": ["Fire", "theft", "guest property"],
#             "deductibles": "IRR 500,000,000 per incident",
#             "additional_coverage": [
#                 "Business interruption",
#                 "loss of revenue due to closure",
#                 "third-party liability"
#             ]
#             },
#             "risk_assessment": {
#             "fire_hazards": [
#                 "Fire alarm and sprinkler system in all rooms",
#                 "fire exits clearly marked"
#             ],
#             "natural_disasters": [
#                 "Low flood risk",
#                 "not located in an earthquake-prone area",
#                 "occasional sandstorms"
#             ],
#             "security_measures": [
#                 "CCTV surveillance",
#                 "24/7 security personnel",
#                 "secure entry systems"
#             ]
#             },
#             "financial_information": {
#             "property_value": "IRR 1,000,000,000,000",
#             "business_revenue": "IRR 300,000,000,000 annually"
#             },
#             "contact_person": {
#             "name": "Oliver Green",
#             "email": "oliver.green@primeinsurance.com",
#             "phone": "+971 4 234 5678"
#             }
#         }
#             Please analyze this submission and determine if it meets all compliance check.
#             """
#         )
#     )

#     current_agent = None
#     current_tool_calls = ""

#     try:
#         async for event in handler.stream_events():
#             if (
#                 hasattr(event, "current_agent_name")
#                 and event.current_agent_name != current_agent
#             ):
#                 current_agent = event.current_agent_name
#                 print(f"\n{'='*50}")
#                 print(f" 🤖 Agent: {current_agent}")
#                 print(f"{'='*50}\n")

#             if isinstance(event, AgentStream):
#                 if event.delta:
#                     print(event.delta, end="", flush=True)
#             elif isinstance(event, AgentInput):
#                 print("\n 📥 Input:", event.input)

#             elif isinstance(event, AgentOutput):
#                 if event.response.content:
#                     print("\n 📤 Output:", event.response.content)
#                 if event.tool_calls:
#                     print(
#                         "\n 🛠️  Planning to use tools:",
#                         [call.tool_name for call in event.tool_calls],
#                     )
#             elif isinstance(event, ToolCallResult):
#                 print(f" 🔧 Tool Result ({event.tool_name}):")
#                 print(f"  Arguments: {event.tool_kwargs}")
#                 print(f"  Output: {event.tool_output}")
#             elif isinstance(event, ToolCall):
#                 print(f" 🔨 Calling Tool: {event.tool_name}")
#                 print(f"  With arguments: {event.tool_kwargs}")

#     except Exception as e:
#         print(f"An error occurred: {e}")

#     response = await handler

#     return response
