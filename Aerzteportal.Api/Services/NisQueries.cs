namespace Aerzteportal.Api.Services;

/// <summary>NIS GraphQL operations we ship to the server. Kept as constants so the wire format stays explicit.</summary>
public static class NisQueries
{
    public const string Me = "query Me { me { id name } }";

    /// <summary>Doctor's open cases. <c>assignedUserIds</c> is filled in per request with the logged-in user's id.</summary>
    public const string CaseDetail = """
query CaseDetail($id: Int!) {
  claim(id: $id) {
    ... on Claim {
      id
      number
      status
      createdOn
      incidentOn
      phase { id name }
      claimant {
        client {
          id
          ... on Client { name }
          ... on ClientPerson { dateOfBirth }
        }
      }
      incidentLocation {
        id
        country { id name }
      }
      coverCause { id code name }
      diagnoses { id isPrimary trimmedName code }
      policy {
        id
        displayNumber
        period { start end }
        lastActiveSituation { id product { id displayName } }
      }
      communications {
        items {
          __typename
          id
          subject
          tags { name }
          ... on FileCommunication {
            files { id name contentType }
          }
        }
      }
      tasksWithQuestionnaires {
        id
        isCompleted
        tags { name }
        questionnaire {
          visibleSections
          visibleQuestions
          unansweredQuestions
          answers {
            ... on DateTimeQuestionnaireAnswer { __typename questionId dateTimeValue: value }
            ... on ChoiceQuestionnaireAnswer   { __typename questionId choiceValue: value }
            ... on TextQuestionnaireAnswer     { __typename questionId textValue: value }
            ... on BoolQuestionnaireAnswer     { __typename questionId boolValue: value }
          }
          definition {
            sections {
              key
              elements {
                ... on QuestionnaireDateTimeQuestion { __typename key name useTime }
                ... on QuestionnaireChoiceQuestion   { __typename key name canSelectMultiple options { key text } }
                ... on QuestionnaireTextQuestion     { __typename key name }
                ... on QuestionnaireBooleanQuestion  { __typename key name }
              }
            }
          }
        }
      }
    }
  }
}
""";

    /// <summary>Updates a task's questionnaire answers and optionally completes the task.</summary>
    public const string UpdateTaskQuestionnaire = """
mutation UpdateTaskQuestionnaire($id: Int!, $answers: [QuestionnaireAnswerInput!]!, $completeTask: Boolean!) {
  updateTask(input: { id: $id, questionnaire: { answers: $answers, completeTask: $completeTask, tags: [] } }) {
    ... on Task {
      id
      isCompleted
      questionnaire {
        visibleSections
        visibleQuestions
        unansweredQuestions
        answers {
          ... on DateTimeQuestionnaireAnswer { __typename questionId dateTimeValue: value }
          ... on ChoiceQuestionnaireAnswer   { __typename questionId choiceValue: value }
          ... on TextQuestionnaireAnswer     { __typename questionId textValue: value }
          ... on BoolQuestionnaireAnswer     { __typename questionId boolValue: value }
        }
      }
    }
  }
}
""";

    /// <summary>Attaches a previously-uploaded temp file to a claim as a FileCommunication addressed to the claimant.</summary>
    public const string CreateFileCommunication = """
mutation CreateFileCommunication($claimId: Int!, $clientId: Int!, $fileId: String!, $subject: String!) {
  createCommunication(
    parentId: $claimId
    parentType: CLAIM
    input: {
      file: {
        subject: $subject
        content: ""
        recipient: { type: CLIENT, id: $clientId }
        uploadedAttachedFileIds: [$fileId]
        tags: [{ name: "aerzteportal" }]
      }
    }
  ) { __typename }
}
""";

    public const string CaseListPage_Cases = """
query CaseListPage_Cases($filters: ClaimListFiltersInput, $pagination: PaginationInput, $order: ClaimOrderInput) {
  claims(filters: $filters, pagination: $pagination, order: $order) {
    items {
      id
      isDraft
      isVip
      status
      number
      createdOn
      phase { id name }
      organisation { id code name }
      claimant {
        client {
          id
          ... on Client { id name }
        }
      }
      incidentLocation {
        id
        country { id name }
        region { id name }
      }
      coverCause { id code name }
      assignee { id name }
      coverage { id name }
      diagnoses { id isPrimary trimmedName code }
      policy {
        id
        displayNumber
        period { start end }
        isCancelled
        isVoided
        isQuote
        lastActiveSituation {
          id
          product { id displayName }
        }
      }
      incidentOn
    }
    totalCount
  }
}
""";
}
