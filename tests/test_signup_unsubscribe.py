def test_signup_and_unsubscribe_flow(client):
    # Arrange
    activity_name = "Chess Club"
    email = "test_student@example.com"

    # Ensure participant not present
    resp_before = client.get("/activities")
    assert resp_before.status_code == 200
    assert email not in resp_before.json()[activity_name]["participants"]

    # Act: signup
    signup_resp = client.post(f"/activities/{activity_name}/signup?email={email}")

    # Assert signup succeeded
    assert signup_resp.status_code == 200
    assert f"Signed up {email}" in signup_resp.json().get("message", "")

    # Act: verify participant present
    resp_after = client.get("/activities")
    assert resp_after.status_code == 200
    assert email in resp_after.json()[activity_name]["participants"]

    # Act: duplicate signup should return 400
    dup_resp = client.post(f"/activities/{activity_name}/signup?email={email}")
    assert dup_resp.status_code == 400

    # Act: unregister
    del_resp = client.delete(f"/activities/{activity_name}/participants?email={email}")
    assert del_resp.status_code == 200
    assert f"Unregistered {email}" in del_resp.json().get("message", "")

    # Act: ensure removed
    resp_final = client.get("/activities")
    assert email not in resp_final.json()[activity_name]["participants"]

    # Act: deleting again should return 404
    del_again = client.delete(f"/activities/{activity_name}/participants?email={email}")
    assert del_again.status_code == 404
