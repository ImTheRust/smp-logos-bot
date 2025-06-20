# Discord Profile Bot

A Discord bot that displays detailed user profile information when using the `/profile` command.

## Features

- **User Profile Display**: Shows comprehensive information about Discord users
- **Rich Embed Format**: Beautiful, organized display with user avatars and formatting
- **Account Statistics**: Account age, server join date, and member duration
- **Role Information**: Lists all user roles in the server
- **Status Display**: Shows current user status (if available)
- **Slash Commands**: Modern Discord slash command implementation

## Information Displayed

When a user runs `/profile`, the bot shows:
- Username and display name
- User ID
- Account creation date and age
- Server join date and membership duration
- User roles
- Current status (online, idle, dnd, offline)
- User avatar

## Setup Instructions

### 1. Create a Discord Application

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to the "Bot" section and click "Add Bot"
4. Copy the bot token (you'll need this later)
5. Go to the "General Information" section and copy the Application ID

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

1. Copy `env.example` to `.env`
2. Fill in your bot credentials:

```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_application_id_here
GUILD_ID=your_server_id_here  # Optional, for testing
```

### 4. Invite the Bot to Your Server

Use this URL (replace `YOUR_CLIENT_ID` with your actual client ID):
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=2048&scope=bot%20applications.commands
```

Required permissions:
- Send Messages
- Use Slash Commands
- Read Message History
- View Channels

### 5. Run the Bot

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

## Usage

Once the bot is running and invited to your server:

1. Type `/profile` in any channel
2. The bot will respond with a rich embed showing your profile information

## Bot Permissions

The bot requires the following permissions:
- **Send Messages**: To respond to commands
- **Use Slash Commands**: To register and use slash commands
- **Read Message History**: To see command interactions
- **View Channels**: To access channel information

## Development

### Project Structure

```
├── index.js          # Main bot file
├── package.json      # Dependencies and scripts
├── env.example       # Environment variables template
└── README.md         # This file
```

### Adding New Commands

To add new slash commands:

1. Add the command definition to the `commands` array in `index.js`
2. Add a handler in the `interactionCreate` event listener
3. Create a handler function for the command

### Environment Variables

- `DISCORD_TOKEN`: Your bot's authentication token
- `CLIENT_ID`: Your Discord application ID
- `GUILD_ID`: (Optional) Specific server ID for testing commands

## Troubleshooting

### Common Issues

1. **Bot not responding**: Check if the bot token is correct and the bot is online
2. **Commands not appearing**: Ensure the bot has the "Use Slash Commands" permission
3. **Missing permissions**: Check that the bot has all required permissions in your server

### Logs

The bot will log important events to the console:
- Bot login status
- Command registration
- Errors and warnings

## License

MIT License - feel free to modify and distribute as needed. 