import re

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_groq import ChatGroq
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate


app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow Chrome extension
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CodeRequest(BaseModel):
    code: str
    model: str
    api_key: str





@app.post("/explain")
async def explain_code(request: CodeRequest):
    try:
        prompt = PromptTemplate(
            input_variables=['code', 'history'],
            template=(
                "If the following code depends on any previously defined code, consider that context while explaining. "
                "Breakdown the given code and explain it line by line, ignoring comments and lines that do not affect execution. Keep the explanations concise and to the point. "
                "Ignore the language name inside the code block.\n"
                "Start with Breakdown of code subheading.\n"
                "At the end give a summary no more than two lines with a subheading \"Summary\".\n"
                "Since the markdown is formatted to HTML, make sure you avoid using unwanted markdown which might affect the final response.\n\n"
                "Only respond in English and avoid language that start from right to left.\n\n"
                "Make sure there is good space between the breakdown and the summary.\n\n"
                "Previously Defined Code:\n{history}\n\n"
                "Current Code:\n{code}"
                )
            )
        
        llm = ChatGroq(temperature=0.6, model='deepseek-r1-distill-qwen-32b', groq_api_key=request.api_key)
        llm_chain = prompt | llm

        history = ''
        if request.code:
            response = llm_chain.invoke({"code":request.code, "history":history}) 
            response = re.sub(r"<think>.*?</think>", "", response.content, flags=re.DOTALL).strip()

            

        return {"explanation": response}
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
