def calculate_risk_score(estimated_loss, incident_type, repeat_offender):
    score = 0

    if estimated_loss >= 1000:
        score += 40
    elif estimated_loss >= 500:
        score += 25
    elif estimated_loss >= 100:
        score += 10

    high_risk_incidents = [
        "Organized Retail Crime",
        "Internal Theft",
        "Fraud",
        "Repeat Shoplifting"
    ]

    if incident_type in high_risk_incidents:
        score =+ 35
    else:
        score =+ 15

    if repeat_offender.lower() == "yes":
        score += 25

    return min(score, 100)