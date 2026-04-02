def test_get_activities_returns_expected_structure(client):
    # Arrange: client fixture

    # Act
    resp = client.get("/activities")

    # Assert
    assert resp.status_code == 200
    data = resp.json()
    # Expecting a dict of activities
    assert isinstance(data, dict)
    # Check a couple of known activities exist
    assert "Chess Club" in data
    assert "Programming Class" in data
    # Each activity should have participants, description, schedule, and max_participants
    sample = data["Chess Club"]
    assert "participants" in sample
    assert "description" in sample
    assert "schedule" in sample
    assert "max_participants" in sample
