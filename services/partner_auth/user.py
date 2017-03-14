# -*- coding: utf-8 -*-


class OAuthUser:
    def __init__(self, access_token, user_id):
        self.user_id = user_id
        self.access_token = access_token
        self.email = None

        self.title = None
        self.name = None

        self.avatar_url = None
        self.description = None


    def __str__(self):
        return (f"OAuthUser(user_id={self.user_id}, "
                f" access_token='{self.access_token}'")
