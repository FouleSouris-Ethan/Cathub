import unittest
from unittest.mock import patch

from pawplatform.Backend import emails


class EmailsTests(unittest.TestCase):
    def test_send_application_status_email_returns_false_when_resend_is_unavailable(self):
        with patch.object(emails, "resend", None):
            result = emails.send_application_status_email(
                to_email="test@example.com",
                cat_name="Moka",
                status="approuvé",
                first_name="Alice",
            )

        self.assertFalse(result)


if __name__ == "__main__":
    unittest.main()
