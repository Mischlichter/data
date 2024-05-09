import os
import time
import json
from requests_oauthlib import OAuth1Session

def create_oauth_session(consumer_key, consumer_secret, access_token, access_token_secret):
    """Create an OAuth1 session."""
    print(f"Creating OAuth session with: {consumer_key}, {consumer_secret}, {access_token}, {access_token_secret}")  # Debug output
    return OAuth1Session(consumer_key, client_secret=consumer_secret, resource_owner_key=access_token, resource_owner_secret=access_token_secret)

def post_tweet(url, session):
    """Post a tweet containing just the URL."""
    api_url = "https://api.twitter.com/2/tweets"
    payload = json.dumps({"text": url})  # Tweet content is just the URL
    response = session.post(api_url, data=payload)
    if response.status_code == 201:
        print("Tweet successfully created.")
        return response.json()['data']['id']
    else:
        raise Exception(f"Failed to post tweet: {response.status_code}, {response.text}")

def delete_tweet(tweet_id, session):
    """Delete the specified tweet."""
    api_url = f"https://api.twitter.com/2/tweets/{tweet_id}"
    response = session.delete(api_url)
    if response.status_code == 200:
        print("Tweet successfully deleted.")
    else:
        raise Exception(f"Failed to delete tweet: {response.status_code}, {response.text}")

def main():
    consumer_key = os.getenv('TWITTER_API_KEY')
    consumer_secret = os.getenv('TWITTER_API_SECRET')
    access_token = os.getenv('TWITTER_ACCESS_TOKEN')
    access_token_secret = os.getenv('TWITTER_ACCESS_TOKEN_SECRET')
    
    if not all([consumer_key, consumer_secret, access_token, access_token_secret]):
        print("Error: Missing one or more required environment variables.")
        return
    
    session = create_oauth_session(consumer_key, consumer_secret, access_token, access_token_secret)
    
    try:
        with open('html_files.txt', 'r') as file:
            html_files = file.readlines()

        for html_file in html_files:
            filename = html_file.strip()
            url = f"https://www.hogeai.com/sharing/{filename}"
            
            # Post the tweet
            tweet_id = post_tweet(url, session)
            print(f"Tweeted URL: {url}, Tweet ID: {tweet_id}")
            
            # Wait for 60 seconds
            time.sleep(60)
            
            # Delete the tweet
            delete_tweet(tweet_id, session)
            
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()
