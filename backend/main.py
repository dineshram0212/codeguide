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
                "Explain the given code line by line, ignoring lines that do not affect execution. Keep the explanations concise and to the point. "
                "Focus on clarity and readability.\n\n"
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
