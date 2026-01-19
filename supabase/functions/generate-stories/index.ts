import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { epic, customPrompt } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert agile product manager and user story writer specializing in financial technology and risk management software. Generate detailed, actionable user stories following best practices.

For each epic, generate 3-5 user stories with:
- Clear title
- User story format (As a [role], I want [feature], so that [benefit])
- 3-5 specific, testable acceptance criteria
- Story points estimation (1, 2, 3, 5, 8, or 13)
- Priority (Must, Should, Could, or Won't based on MoSCoW)
- Definition of Done items
- Relevant tags

Focus on financial risk, fund management, and quantitative analysis terminology where appropriate.`;

    const userPrompt = `Generate user stories for this epic:

Title: ${epic.title}
Description: ${epic.description || 'No description provided'}
Quarter: ${epic.quarter}
Sprint: ${epic.sprint}
Customer: ${epic.customer || 'General'}
Module: ${epic.module || 'General'}

${customPrompt ? `Additional instructions: ${customPrompt}` : ''}

Return a JSON object with a "stories" array containing the user stories.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_user_stories",
              description: "Generate user stories for an epic",
              parameters: {
                type: "object",
                properties: {
                  stories: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        asA: { type: "string" },
                        iWant: { type: "string" },
                        soThat: { type: "string" },
                        acceptanceCriteria: { type: "array", items: { type: "string" } },
                        storyPoints: { type: "number" },
                        priority: { type: "string", enum: ["Must", "Should", "Could", "Won't"] },
                        definitionOfDone: { type: "array", items: { type: "string" } },
                        tags: { type: "array", items: { type: "string" } },
                      },
                      required: ["title", "asA", "iWant", "soThat", "acceptanceCriteria", "storyPoints", "priority", "definitionOfDone"],
                    },
                  },
                },
                required: ["stories"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_user_stories" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall?.function?.arguments) {
      throw new Error("Invalid response from AI");
    }

    const stories = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(stories), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
