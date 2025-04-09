-- Database Schema for Tweet Manager Application

-- Organizations Table
CREATE TABLE organizations (
    id UUID PRIMARY KEY,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email TEXT NOT NULL,
    first_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    organization_id UUID REFERENCES organizations(id),
    role TEXT,
    auth_user_id UUID,
    stripe_customer_id TEXT
);
CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);

-- Clients Table
CREATE TABLE clients (
    client_id TEXT PRIMARY KEY,
    name TEXT,
    organization_id UUID REFERENCES organizations(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    profile_photo_url TEXT,
    username TEXT
);
CREATE INDEX idx_clients_organization_id ON clients(organization_id);
CREATE INDEX idx_clients_username ON clients(username);

-- Threads Table
CREATE TABLE threads (
    thread_id TEXT PRIMARY KEY,
    title TEXT,
    theme TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    repackaged_linkedin BOOLEAN,
    repackaged_instagram BOOLEAN,
    client_id TEXT REFERENCES clients(client_id)
);
CREATE INDEX idx_threads_client_id ON threads(client_id);

-- Tweets Table
CREATE TABLE tweets (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    client_id TEXT REFERENCES clients(client_id),
    text TEXT,
    like_count TEXT,
    retweet_count TEXT,
    reply_count TEXT,
    quote_count TEXT,
    view_count TEXT,
    date_posted TEXT,
    thread_id TEXT REFERENCES threads(thread_id),
    media JSONB,
    extra_data JSONB
);
CREATE INDEX idx_tweets_client_id ON tweets(client_id);
CREATE INDEX idx_tweets_thread_id ON tweets(thread_id);
CREATE INDEX idx_tweets_created_at ON tweets(created_at);

-- Instagram Posts Table
CREATE TABLE instagram (
    id TEXT PRIMARY KEY,
    client_id TEXT REFERENCES clients(client_id),
    timestamp TIMESTAMP WITH TIME ZONE,
    inputurl TEXT,
    ownerusername TEXT,
    ownerid TEXT,
    commentscount INTEGER,
    likescount INTEGER,
    caption TEXT,
    hashtags JSONB,
    videoviewcount INTEGER,
    videoplaycount INTEGER,
    shortcode TEXT,
    videoduration DOUBLE PRECISION,
    type TEXT,
    musicinfo JSONB,
    images JSONB,
    taggedusers JSONB,
    coauthorproducers JSONB
);
CREATE INDEX idx_instagram_client_id ON instagram(client_id);
CREATE INDEX idx_instagram_timestamp ON instagram(timestamp);
CREATE INDEX idx_instagram_ownerusername ON instagram(ownerusername);

-- LinkedIn Posts Table
CREATE TABLE linkedin_posts (
    urn TEXT PRIMARY KEY,
    client_id TEXT REFERENCES clients(client_id),
    postedattimestamp TIMESTAMP WITH TIME ZONE,
    author TEXT,
    text TEXT,
    numcomments INTEGER,
    numlikes INTEGER,
    numshares INTEGER,
    type TEXT,
    linkedinvideo TEXT,
    article TEXT,
    images JSONB,
    inputurl TEXT,
    isrepost BOOLEAN
);
CREATE INDEX idx_linkedin_posts_client_id ON linkedin_posts(client_id);
CREATE INDEX idx_linkedin_posts_postedattimestamp ON linkedin_posts(postedattimestamp);
CREATE INDEX idx_linkedin_posts_author ON linkedin_posts(author);

-- TikTok Content Table
CREATE TABLE tiktok (
    id TEXT PRIMARY KEY,
    client_id TEXT REFERENCES clients(client_id),
    text TEXT,
    webvideourl TEXT,
    createtime INTEGER,
    input TEXT,
    collectcount INTEGER,
    playcount INTEGER,
    diggcount INTEGER,
    sharecount INTEGER,
    commentcount INTEGER,
    authormeta JSONB,
    videometa JSONB,
    musicmeta JSONB
);
CREATE INDEX idx_tiktok_client_id ON tiktok(client_id);
CREATE INDEX idx_tiktok_createtime ON tiktok(createtime);

-- YouTube Data Table
CREATE TABLE youtube_data (
    id TEXT PRIMARY KEY,
    client_id TEXT REFERENCES clients(client_id),
    channelurl TEXT,
    channelname TEXT,
    channelid TEXT,
    channelusername TEXT,
    date TIMESTAMP WITH TIME ZONE,
    input TEXT,
    likes INTEGER,
    commentscount INTEGER,
    viewcount INTEGER,
    duration DOUBLE PRECISION,
    thumbnailurl TEXT,
    text TEXT,
    type TEXT,
    "progress / key" TEXT,
    descriptionlinks JSONB,
    "order" INTEGER
);
CREATE INDEX idx_youtube_data_client_id ON youtube_data(client_id);
CREATE INDEX idx_youtube_data_date ON youtube_data(date);
CREATE INDEX idx_youtube_data_channelname ON youtube_data(channelname);

-- Reports Table
CREATE TABLE reports (
    id INTEGER PRIMARY KEY,
    client_id TEXT NOT NULL REFERENCES clients(client_id),
    report_date_range TEXT NOT NULL,
    platform TEXT,
    content JSONB,
    month TEXT
);
CREATE INDEX idx_reports_client_id ON reports(client_id);
CREATE INDEX idx_reports_platform ON reports(platform);
CREATE INDEX idx_reports_month ON reports(month);