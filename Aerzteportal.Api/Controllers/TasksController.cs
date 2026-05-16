using System.Text.Json;
using Aerzteportal.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Aerzteportal.Api.Controllers;

[ApiController]
[Route("api/cases/{caseId:int}/tasks")]
public class TasksController(NisGraphQLService gql, NisSession session) : ControllerBase
{
    /// <summary>
    /// Submits a questionnaire to NIS. The frontend hands us answer values
    /// keyed by question id; we shape them into the NIS
    /// <c>QuestionnaireAnswerInput</c> union before forwarding.
    /// </summary>
    public record AnswerInput(
        string QuestionId,
        string Type,
        string? Date,
        string[]? Choices,
        string? StringValue,
        bool? Bool);

    public record SubmitRequest(AnswerInput[] Answers, bool CompleteTask);

    [HttpPost("{taskId:int}/answers")]
    public async Task<IActionResult> Submit(int caseId, int taskId, [FromBody] SubmitRequest req, CancellationToken ct)
    {
        if (await session.GetAccessTokenAsync(ct) is null) return Unauthorized();

        var answers = req.Answers.Select(a => new
        {
            questionId = a.QuestionId,
            value = a.Type switch
            {
                "date" => (object)new { date = a.Date },
                "choice" => new { choices = a.Choices ?? Array.Empty<string>() },
                "text" => new { @string = a.StringValue ?? "" },
                "bool" => new { @bool = a.Bool ?? false },
                _ => new { },
            },
        }).ToArray();

        var vars = new { id = taskId, answers, completeTask = req.CompleteTask };
        var data = await gql.QueryAsync("UpdateTaskQuestionnaire", NisQueries.UpdateTaskQuestionnaire, vars, ct);
        if (data is null) return StatusCode(502);
        return Ok(data);
    }
}
