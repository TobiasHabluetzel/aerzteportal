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
          id
          subject
          tags { name }
        }
      }
      tasksWithQuestionnaires {
        id
        name
        tags { name }
      }
    }
  }
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
