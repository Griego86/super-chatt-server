CREATE DATABASE superchattdb;

CREATE TABLE Users (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(30),
  password VARCHAR(80),
  email VARCHAR(255),
  display_name VARCHAR(30),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  active BOOLEAN DEFAULT TRUE
);

CREATE TABLE User_friends (
  user_friend_id SERIAL PRIMARY KEY,
  user_id INT,
  friend_id INT,
  blocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  display_name VARCHAR(30)
  FOREIGN KEY (user_id) REFERENCES Users (user_id)
);

CREATE TABLE Chats (
  chat_id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Messages (
  message_id SERIAL PRIMARY KEY,
  content VARCHAR(25000),
  reply_content VARCHAR(25000),
  reply_username VARCHAR(32),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  username VARCHAR(32),
  chat_id INT
  FOREIGN KEY (chat_id) REFERENCES Chats (chat_id)
);

CREATE TABLE User_chats (
  user_chat_id SERIAL PRIMARY KEY,
  user_id INT,
  chat_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Comments (
  comment_id SERIAL PRIMARY KEY,
  email VARCHAR(255),
  content VARCHAR(250000),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);