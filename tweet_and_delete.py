import requests
import os
import time
import json

def create_headers(bearer_token):
    """Create the necessary headers for the request."""
    headers = {
        "Authorization": f"Bearer {bearer_token}",
        "Content-Type": "application/json"
    }
    return headers

def post_tweet(url, bearer_token):
    """Post a tweet containing just the URL."""
    api_url = "https://api.twitter.com/2/tweets"
    headers = create_headers(bearer_token)
    payload = json.dumps({
        "text": url  # Tweet content is just the URL
    })
    response = requests.post(api_url, headers=headers, data=payload)
    if response.status_code == 201:
        print("Tweet successfully created.")
        return response.json()['data']['id']
    else:
        raise Exception(f"Failed to post tweet: {response.status_code}, {response.text}")

def delete_tweet(tweet_id, bearer_token):
    """Delete the specified tweet."""
    api_url = f"https://api.twitter.com/2/tweets/{tweet_id}"
    headers = create_headers(bearer_token)
    response = requests.delete(api_url, headers=headers)
    if response.status_code == 200:
        print("Tweet successfully deleted.")
    else:
        raise Exception(f"Failed to delete tweet: {response.status_code}, {response.text}")

def main():
    bearer_token = os.getenv('BEARER_TOKEN')
    try:
        with open('html_files.txt', 'r') as file:
            html_files = file.readlines()

        for html_file in html_files:
            filename = html_file.strip()
            url = f"https://www.hogeai.com/sharing/{filename}"
            
            # Post the tweet
            tweet_id = post_tweet(url, bearer_token)
            print(f"Tweeted URL: {url}, Tweet ID: {tweet_id}")
            
            # Wait for 60 seconds
            time.sleep(60)
            
            # Delete the tweet
            delete_tweet(tweet_id, bearer_token)
            
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()
