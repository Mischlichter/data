import os
import time
from requests_oauthlib import OAuth1Session

def create_oauth_session():
    return OAuth1Session(
        client_key=os.getenv('TWITTER_API_KEY'),
        client_secret=os.getenv('TWITTER_API_SECRET'),
        resource_owner_key=os.getenv('TWITTER_ACCESS_TOKEN'),
        resource_owner_secret=os.getenv('TWITTER_ACCESS_TOKEN_SECRET')
    )

def read_html_files():
    with open('html_files.txt', 'r') as file:
        return [line.strip() for line in file.readlines()]

def post_and_delete_tweets(html_files, session):
    for html_file in html_files:
        # Assuming the html_file variable holds a URL or a path that can be included in the tweet
        tweet_text = f"Check out our latest content: https://hogeai.com/sharing/{html_file}"
        response = session.post('https://api.twitter.com/2/tweets', json={'text': tweet_text})
        if response.status_code == 201:
            tweet_id = response.json()['data']['id']
            print(f"Tweet posted successfully: {tweet_id}")
            time.sleep(60)  # Wait for 60 seconds before deleting
            delete_response = session.delete(f'https://api.twitter.com/2/tweets/{tweet_id}')
            if delete_response.status_code == 200:
                print("Tweet deleted successfully.")
            else:
                print(f"Failed to delete tweet: {delete_response.status_code}")
        else:
            print(f"Failed to post tweet: {response.text}")

if __name__ == "__main__":
    session = create_oauth_session()
    html_files = read_html_files()
    post_and_delete_tweets(html_files, session)