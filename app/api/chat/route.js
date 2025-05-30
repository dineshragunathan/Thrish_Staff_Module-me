import { Pool } from 'pg';
import axios from 'axios';

// Configuration
// const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export async function POST(req) {
  try {
    const { query, id } = await req.json();

    // 1. Get embedding (fallback method)
    const embedding = await generateEmbedding(query);

    // 2. Vector search
    const results = await vectorSearch(embedding, id);

    // 3. Generate response
    const answer = await generateResponse(query, results);

    return Response.json({ answer });

  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper functions
async function generateEmbedding(text) {
  try {
    const response = await axios.post('http://localhost:11434/api/embeddings', {
      model: 'nomic-embed-text', // Must match exactly
      prompt: text
    });

    // Validate response
    if (!response.data?.embedding || !Array.isArray(response.data.embedding)) {
      throw new Error('Invalid embedding response');
    }

    const embedding = response.data.embedding;
    // console.log("Embedding of user query: ", embedding);

    // Verify 768 dimensions
    if (embedding.length !== 768) {
      throw new Error(`Dimension mismatch: Expected 768, got ${embedding.length}`);
    }

    return embedding;

  } catch (error) {
    console.error('Embedding error:', error.message);

    // Fallback to zero vector
    return new Array(768).fill(0);
  }
}

async function vectorSearch(embedding, id) {
  const client = await pool.connect();
  const { rows } = await client.query(
    `SELECT 
      project_title AS title,
      project_description AS description,
      year_of_award AS year
     FROM project_details 
     WHERE faculty_id = $2
     ORDER BY embedding <=> $1
     LIMIT 5`,
    [JSON.stringify(embedding), id]
  );
  client.release();
  // console.log("Vector search results: ", rows);
  return rows;
}

async function generateResponse(query, context) {
  const formattedContext = context.map((c, index) =>
    `PROJECT ${index + 1}:
     Title: ${c.title || 'No title available'}
     Description: ${c.description || 'No description'}
     Year: ${c.year || 'Unknown year'}`).join('\n\n');

  console.log("formattedContext:", formattedContext);

  try {
    const res = await axios.post('http://localhost:11434/api/chat', {
      model: 'llama3.2',
      messages: [
        {
          role: 'system',
          content: `
                    ### Role ###  
                    You are a research specialist analyzing academic projects. Strictly use only the provided context to answer.  

                    ### Context ###  
                    #### Projects ####  
                    ${formattedContext}  

                    #### Patents ####  
                    None available.  

                    ### Response Rules ###  
                    1. No self-reference: Do not mention your identity or system.  
                    2. Precision:  
                      - If the query matches context, respond concisely (3-4 sentences max).  
                      - If no match exists, state: "No relevant data in the provided records."  
                    3. Format:  
                      - Skip disclaimers (e.g., "based on the context").  
                      - Use bullet points for multi-part answers.  
                    4. Error Handling:  
                      - If the context is malformed, say: "Data format error. Please verify the input."`
        },
        { role: 'user', content: query }
      ],
      stream: false
    });

    return res.data.message?.content || "No relevant information found";

  } catch (error) {
    console.error('Generation error:', error.response?.data || error.message);
    return "Unable to retrieve information";
  }

}
