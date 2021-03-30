console.log('Beep beeep!');

const  Discord = require('discord.js');
//connection to mySQL database 
const Sequelize = require('sequelize');


const client = new Discord.Client();
const PREFIX ='!';

//connection information
const sequelize = new Sequelize('database', 'user', 'password', {
    //where to look for the database
	host: 'localhost',
    //database engine 
	dialect: 'sqlite',
	logging: false,
	// SQLite only
	storage: 'database.sqlite',
});

/*
CREATING TABLE 
 * equivalent to: CREATE TABLE tags(
 * name VARCHAR(255),
 * description TEXT,
 * username VARCHAR(255),
 * usage INT
 * );

*/
//

const Tags = sequelize.define('tags', {
	name: {
        //what kind of data attribute is going to store 
		type: Sequelize.STRING,
        //no duplicated entries 
		unique: true,
	},
	description: Sequelize.TEXT,
	username: Sequelize.STRING,
	usage_count: {
		type: Sequelize.INTEGER,
		defaultValue: 0,
		allowNull: true,
	},
});

//syncing the model 
client.once('ready',() => {
    Tags.sync();
});

//Adding the tag
client.on('message', async message => {
	if (message.content.startsWith(PREFIX)) {
		const input = message.content.slice(PREFIX.length).trim().split(' ');
		const command = input.shift();
		const commandArgs = input.join(' ');

		if (command === 'addtag') {
			// Writting the first command

               const splitArgs = commandArgs.split(' ');
                const tagName = splitArgs.shift();
                const tagDescription = splitArgs.join(' ');

                try {
                    // equivalent to: INSERT INTO tags (name, description, username) values (?, ?, ?);
                    const tag = await Tags.create({
                        name: tagName,
                        description: tagDescription,
                        username: message.author.username,
                    });
                    return message.reply(`Tag ${tag.name} added.`);
                }
                catch (e) {
                    if (e.name === 'SequelizeUniqueConstraintError') {
                        return message.reply('That tag already exists.');
                    }
                    return message.reply('Something went wrong with adding a tag.');
                }
		} else if (command === 'tag') {
			// [Fetch Tag]
            const tagName = commandArgs;
            // equivalent to: SELECT * FROM tags WHERE name = 'tagName' LIMIT 1;
            const tag = await Tags.findOne({ where: { name: tagName } });
            if (tag) {
                // equivalent to: UPDATE tags SET usage_count = usage_count + 1 WHERE name = 'tagName';
                tag.increment('usage_count');
                return message.channel.send(tag.get('description'));
}
return message.reply(`Could not find tag: ${tagName}`);
		} else if (command === 'edittag') {
			// [Edit Tag]
            const splitArgs = commandArgs.split(' ');
            const tagName = splitArgs.shift();
            const tagDescription = splitArgs.join(' ');

            // equivalent to: UPDATE tags (description) values (?) WHERE name='?';
            const affectedRows = await Tags.update({ description: tagDescription }, { where: { name: tagName } });
            if (affectedRows > 0) {
                return message.reply(`Tag ${tagName} was edited.`);
            }
            return message.reply(`Could not find a tag with name ${tagName}.`);
		} else if (command === 'taginfo') {
			// [Display Tag Info]
            const tagName = commandArgs;

            // equivalent to: SELECT * FROM tags WHERE name = 'tagName' LIMIT 1;
            const tag = await Tags.findOne({ where: { name: tagName } });
            if (tag) {
                return message.channel.send(`${tagName} was created by ${tag.username} at ${tag.createdAt} and has been used ${tag.usage_count} times.`);
            }
            return message.reply(`Could not find tag: ${tagName}`);
		} else if (command === 'showtags') {
			// [Show all tags]
            // equivalent to: SELECT name FROM tags;
            const tagList = await Tags.findAll({ attributes: ['name'] });
            const tagString = tagList.map(t => t.name).join(', ') || 'No tags set.';
            return message.channel.send(`List of tags: ${tagString}`);
		} else if (command === 'removetag') {
			// [Delete Tag]
            const tagName = commandArgs;
            // equivalent to: DELETE from tags WHERE name = ?;
            const rowCount = await Tags.destroy({ where: { name: tagName } });
            if (!rowCount) return message.reply('That tag did not exist.');

            return message.reply('Tag deleted.');
		}
	}
});

client.login('ODI2NTE4NjM5NTA3Mjc1Nzc3.YGNpdw.pL3qdIUqIyl5r-eNG52vbJGsKVg');