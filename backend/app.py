import os
import re
from dotenv import load_dotenv

import streamlit as st
from langchain_ollama.llms import OllamaLLM
from langchain_groq import ChatGroq

from langchain.memory import ConversationBufferMemory
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain, SequentialChain


load_dotenv()
apikey = os.getenv('GROQ_API_KEY')

# Adding Memory
memory = ConversationBufferMemory(input_key = 'code', memory_key='history')


# Prompt Template
explain_code_template = PromptTemplate(
    input_variables=['code'],
    template=(
        "If the following code depends on any previously defined code, consider that context while explaining. "
        "Breakdown the give code, ignoring lines that do not affect execution. Keep the explanations concise and to the point. "
        "Focus on clarity and readability.\n\n"
        "Previously Defined Code:\n{history}\n\n"
        "Current Code:\n{code}"
    )
)

# optimize_code_template = PromptTemplate(
#     input_variables=['code'],
#     template = 'Optimize this code: {code}'
# )


# LLM
# llm = OllamaLLM(model='llama3.2')
llm = ChatGroq(groq_api_key=apikey, model='deepseek-r1-distill-qwen-32b', temperature=0.6)

# Chain
explain_chain = LLMChain(llm=llm, prompt=explain_code_template, output_key = 'explanation', memory=memory, verbose=True)
# optimize_chain = LLMChain(llm=llm, prompt=optimize_code_template, output_key = 'optimized', verbose=True)

# seq_chain = SequentialChain(chains=[optimize_chain, explain_chain], input_variables=['code'], output_variables=['optimized', 'explanation'], verbose=True)


st.title('CH@bot')
prompt = st.text_input("Enter your message")


if prompt:
    # load histroy from memory
    history = memory.load_memory_variables({}).get('history', '')

    # response = seq_chain({'code':prompt})
    response = explain_chain.run(code=prompt, history=history)


    response = re.sub(r"<think>.*?</think>", "", response, flags=re.DOTALL).strip()

    memory.save_context({'code':prompt}, {'explanation':response})

    st.header('Heres the explanation')
    st.write(response)
    # st.write(response['explanation'])
    # st.header('Optimized Version')
    # st.write(response['optimized'])