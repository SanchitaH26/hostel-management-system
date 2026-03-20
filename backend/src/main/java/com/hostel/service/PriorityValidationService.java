package com.hostel.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hostel.model.Complaint;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Service
public class PriorityValidationService {

    @Value("${groq.api.key:}")
    private String apiKey;

    private final HttpClient   httpClient   = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String PRIORITY_RULES =
            "Priority level definitions for a student hostel:\n" +
            "LOW    : Minor inconvenience. E.g. flickering light, loose furniture, dusty room.\n" +
            "MEDIUM : Noticeable problem. E.g. slow internet, dirty corridor, one tap not working.\n" +
            "HIGH   : Affects daily routine. E.g. no hot water, broken door lock, electricity in one room.\n" +
            "URGENT : Emergency or safety risk. E.g. gas leak, flooded room, complete power failure for hostel.\n";

    public static class ValidationResult {
        public final boolean valid;
        public final String  message;
        public final String  suggestedPriority;

        public ValidationResult(boolean valid, String message, String suggestedPriority) {
            this.valid             = valid;
            this.message           = message;
            this.suggestedPriority = suggestedPriority;
        }
    }

    public ValidationResult validate(String title,
                                     String description,
                                     Complaint.Category category,
                                     Complaint.Priority selectedPriority) {

        if (apiKey == null || apiKey.isBlank()) {
            System.out.println("[PriorityValidator] groq.api.key not set — skipping validation.");
            return new ValidationResult(true, "Validation skipped.", null);
        }

        try {
            String prompt  = buildPrompt(title, description, category, selectedPriority);
            String aiReply = callGroqApi(prompt);
            return parseResponse(aiReply);

        } catch (Exception e) {
            // First attempt failed — retry once
            System.err.println("[PriorityValidator] Groq API error (attempt 1): " + e.getMessage());
            System.out.println("[PriorityValidator] Retrying...");
            try {
                String prompt  = buildPrompt(title, description, category, selectedPriority);
                String aiReply = callGroqApi(prompt);
                return parseResponse(aiReply);
            } catch (Exception e2) {
                // Both attempts failed — fail open
                System.err.println("[PriorityValidator] Groq API error (attempt 2): " + e2.getMessage());
                System.out.println("[PriorityValidator] Both attempts failed — allowing submission.");
                return new ValidationResult(true,
                        "Validation unavailable. Complaint submitted.", null);
            }
        }
    }

    private String buildPrompt(String title, String description,
                                Complaint.Category category,
                                Complaint.Priority selectedPriority) {
        return PRIORITY_RULES + "\n" +
               "Complaint:\n" +
               "- Category: "    + category.name()           + "\n" +
               "- Title: "       + title                     + "\n" +
               "- Description: " + description               + "\n" +
               "- Student selected priority: " + selectedPriority.name() + "\n\n" +
               "Rules:\n" +
               "1. Be STRICT. Match priority exactly to the correct level.\n" +
               "2. REJECT if selected priority is even one level too high.\n" +
               "   E.g. 'bed too comfortable' = LOW. Reject MEDIUM, HIGH, URGENT.\n" +
               "   E.g. 'light flickers once' = LOW. Reject anything higher.\n" +
               "   E.g. 'dirty corridor' = MEDIUM. Reject HIGH or URGENT.\n" +
               "   E.g. 'no water in one tap' = MEDIUM. Reject HIGH or URGENT.\n" +
               "3. Only accept URGENT for real emergencies: gas leak, flooding, complete power failure.\n" +
               "4. Only accept HIGH for issues affecting entire room function or multiple students.\n" +
               "5. Vague or trivial descriptions = LOW. Reject anything higher than LOW.\n\n" +
               "Respond ONLY in this JSON (no markdown, no extra text):\n" +
               "{\"valid\": true, \"reason\": \"explanation\", \"suggested_priority\": \"LOW|MEDIUM|HIGH|URGENT\"}\n" +
               "Include suggested_priority only when valid=false.";
    }

    private String callGroqApi(String prompt) throws Exception {
        String escapedPrompt = objectMapper.writeValueAsString(prompt);
        String requestBody =
                "{\"model\":\"llama-3.1-8b-instant\",\"max_tokens\":200,\"temperature\":0.1," +
                "\"messages\":[{\"role\":\"user\",\"content\":" + escapedPrompt + "}]}";

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.groq.com/openai/v1/chat/completions"))
                .timeout(Duration.ofSeconds(30))
                .header("Content-Type",  "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException("Groq HTTP " + response.statusCode() + ": " + response.body());
        }

        JsonNode root = objectMapper.readTree(response.body());
        return root.path("choices").get(0).path("message").path("content").asText();
    }

    private ValidationResult parseResponse(String aiResponse) {
        try {
            String cleaned = aiResponse
                    .replaceAll("(?s)```json", "")
                    .replaceAll("(?s)```", "")
                    .trim();
            int start = cleaned.indexOf('{');
            int end   = cleaned.lastIndexOf('}');
            if (start != -1 && end != -1) cleaned = cleaned.substring(start, end + 1);

            JsonNode json      = objectMapper.readTree(cleaned);
            boolean  valid     = json.path("valid").asBoolean(true);
            String   reason    = json.path("reason").asText("Priority looks appropriate.");
            String   suggested = json.has("suggested_priority")
                                     ? json.path("suggested_priority").asText(null) : null;

            if (valid) return new ValidationResult(true, reason, null);

            return new ValidationResult(false,
                    "⚠ Priority mismatch: " + reason +
                    " Suggested: " + (suggested != null ? suggested : "MEDIUM") +
                    ". Please adjust and resubmit.",
                    suggested);

        } catch (Exception e) {
            System.err.println("[PriorityValidator] Parse error: " + e.getMessage());
            return new ValidationResult(true, "Parse failed. Complaint submitted.", null);
        }
    }
}