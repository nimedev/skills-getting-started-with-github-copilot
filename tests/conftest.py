from copy import deepcopy
import pytest

from fastapi.testclient import TestClient

import src.app as app_module


@pytest.fixture(autouse=True)
def isolate_activities():
    """Ensure tests don't mutate the global in-memory activities across tests.

    Arrange: make a deep copy of the activities dict
    Act: yield control to the test
    Assert: restore the original activities after the test
    """
    original = deepcopy(app_module.activities)
    try:
        yield
    finally:
        app_module.activities.clear()
        app_module.activities.update(original)


@pytest.fixture
def client():
    """Provide a TestClient for the FastAPI app."""
    return TestClient(app_module.app)
