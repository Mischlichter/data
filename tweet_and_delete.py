from TwitterAPI import TwitterAPI, TwitterOAuth, TwitterRequestError, TwitterConnectionError
import time
import os

def create_client():
    try:
        o = TwitterOAuth.read_file()  # Assumes you have Twitter credentials in a file
        api = TwitterAPI(o.consumer_key, o.consumer_secret, auth_type='oAuth2')
        return api
    except Exception as e:
        print(f"Failed to authenticate: {e}")
        return None

def tweet_and_delete(api, file_path):
    if api is None:
        print("API client is not initialized.")
        return

    try:
        with open(file_path, 'r') as file:
            html_files = file.readlines()
        
        for html_file in html_files:
            html_file = html_file.strip()
            tweet_text = f"Check out our latest content: https://www.hogeai.com/sharing/{html_file}"
            response = api.request('tweets', {'text': tweet_text}, method_override='POST')
            
            if response.status_code == 201:
                tweet_id = response.json()['data']['id']
                print(f"Tweeted: {tweet_id} - {tweet_text}")
                
                # Wait for 60 seconds before deleting the tweet
                time.sleep(60)
                
                del_response = api.request(f'tweets/:{tweet_id}', method_override='DELETE')
                if del_response.status_code == 200:
                    print(f"Deleted Tweet ID: {tweet_id}")
                else:
                    print(f"Failed to delete tweet: {del_response.status_code} - {del_response.text}")
            else:
                print(f"Failed to tweet: {response.status_code} - {response.text}")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    client = create_client()
    tweet_and_delete(client, 'html_files.txt')
