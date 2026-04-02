from src.app import app


def test_root_redirects_to_static_index(client):
    # Arrange: client fixture provided by conftest

    # Act
    response = client.get("/")

    # Assert
    assert response.status_code in (200, 307, 302)
    # Follow redirects if necessary
    if response.is_redirect:
        location = response.headers.get("location")
        assert location and location.endswith("/static/index.html")


def test_static_index_served(client):
    # Arrange

    # Act
    response = client.get("/static/index.html")

    # Assert
    assert response.status_code == 200
    assert "Mergington High School" in response.text
