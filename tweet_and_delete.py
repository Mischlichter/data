import os
import time
import json
from requests_oauthlib import OAuth1Session

def create_oauth_session():
    """Create and return an OAuth1 session."""
    return OAuth1Session(
        client_key=os.getenv('TWITTER_API_KEY'),
        client_secret=os.getenv('TWITTER_API_SECRET'),
        resource_owner_key=os.getenv('TWITTER_ACCESS_TOKEN'),
        resource_owner_secret=os.getenv('TWITTER_ACCESS_TOKEN_SECRET')
    )

def post_tweet(text, session):
    """Post a tweet with the given text using the provided OAuth1 session."""
    url = 'https://api.twitter.com/2/tweets'
    payload = json.dumps({'text': text})
    headers = {'Content-Type': 'application/json'}
    response = session.post(url, headers=headers, data=payload)
    
    if response.status_code == 201:
        print("Tweet successfully created.")
        return response.json()['data']['id']
    else:
        print("Failed to post tweet:", response.text)
        return None

def delete_tweet(tweet_id, session):
    """Delete the tweet with the specified ID."""
    url = f'https://api.twitter.com/2/tweets/{tweet_id}'
    response = session.delete(url)
    if response.status_code == 200:
        print("Tweet successfully deleted.")
    else:
        print("Failed to delete tweet:", response.text)

def main():
    session = create_oauth_session()

    try:
        with open('html_files.txt', 'r') as file:
            html_files = file.readlines()

        for html_file in html_files:
            filename = html_file.strip()
            url = f"https://www.hogeai.com/sharing/{filename}"
            
            # Post the tweet
            tweet_id = post_tweet(url, session)
            if tweet_id:
                print(f"Tweeted URL: {url}, Tweet ID: {tweet_id}")
            
                # Wait for 60 seconds
                time.sleep(60)
                
                # Delete the tweet
                delete_tweet(tweet_id, session)
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()
