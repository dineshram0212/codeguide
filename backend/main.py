import re
import uvicorn
import threading

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict

from langchain_groq import ChatGroq
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain.prompts import PromptTemplate

from langchain.memory import ConversationBufferMemory

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
    tab_id: str


LLM_CLASSES = {
    "deepseek-r1-distill-llama-70b": ChatGroq,
    "gpt-4": ChatOpenAI,
    "gpt-3.5-turbo": ChatOpenAI,
    "claude-3-haiku": ChatAnthropic,
    "claude-3-sonnet": ChatAnthropic,
}


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
            "Previously defined code:\n{history}\n\n"
            "Current Code:\n{code}"
            )
        )


memory_store: Dict[str, ConversationBufferMemory] = {}


@app.post("/explain")
async def explain_code(request: CodeRequest):
    try:
        if request.tab_id not in memory_store:
            memory_store[request.tab_id] = ConversationBufferMemory(return_messages=False)

        memory = memory_store[request.tab_id]

        if request.model not in LLM_CLASSES:
            raise HTTPException(status_code=400, detail="Unsupported model selected")
        
        llm_class = LLM_CLASSES[request.model]
        
        llm = llm_class(temperature=0.6, model=request.model, api_key=request.api_key)

        llm_chain = prompt | llm 

        if request.code:
            response = llm_chain.invoke({"code":request.code, "history":memory.load_memory_variables({}).get("history", "")}) 
            response = re.sub(r"<think>.*?</think>", "", response.content, flags=re.DOTALL).strip()
            memory.save_context({"input":request.code}, {"output":response})

        return {"explanation": response}
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/clear_memory")
async def clear_memory(tab_id: str):
    memory_store.pop(tab_id, None)
    return {"message": f"Memory cleared for tab {tab_id}"}


def start_server():
    uvicorn.run(app, host="127.0.0.1", port=8000)

if __name__ == "__main__":
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()

    while True:
        try:
            message = input()  
        except EOFError:
            break
