/*
implementation pla
stage1 : Indexing
1. load the document - pdf,text
2. Chunk the document
3. Generate the vector embeddings
4. Store the vector embeddings

Stage 2: Using the chatbot
1. Setup the LLM
2. Add retrieval step.
3. Pass input + relevant informatino to  LLM
4. Congratulations
*/

import { indexTheDocument } from "./prepare.js";
const docPath='./policy.pdf'
indexTheDocument(docPath);
