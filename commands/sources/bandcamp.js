const play = require('../../utils/play.js');
const patreon = require('../../resources/patreon.json');
const premium = require('../../utils/premium/premium.js');

module.exports = {
	name: 'bandcamp',
	description: 'Plays a song from bandcamp.',
	args: true,
	usage: '<search query>',
	async execute(client, message, args) {
		if (!message.member.voice.channel) return client.responses('noVoiceChannel', message);

		const permissions = message.member.voice.channel.permissionsFor(client.user);
		if(!permissions.has('CONNECT')) return client.responses('noPermissionConnect', message);
		if(!permissions.has('SPEAK')) return client.responses('noPermissionSpeak', message);

		let player = client.music.players.get(message.guild.id);

		if (!player) {
			player = client.music.players.spawn({
				guild: message.guild,
				textChannel: message.channel,
				voiceChannel: message.member.voice.channel,
			});
		}

		if (player.pause == 'paused') return message.channel.send(`Cannot play/queue songs while paused. Do \`${client.settings.prefix} resume\` to play.`);

		const msg = await message.channel.send(`${client.emojiList.cd}  Searching for \`${args.join(' ')}\`...`);

		if(await songLimit() == patreon.defaultMaxSongs && player.queue.size >= patreon.defaultMaxSongs) return msg.edit(`You have reached the **maximum** amount of songs (${patreon.defaultMaxSongs} songs). Want more songs? Consider donating here: https://www.patreon.com/eartensifier`);
		if(await songLimit() == patreon.premiumMaxSongs && player.queue.size >= patreon.premiumMaxSongs) return msg.edit(`You have reached the **maximum** amount of songs (${patreon.premiumMaxSongs} songs). Want more songs? Consider donating here: https://www.patreon.com/eartensifier`);
		if(await songLimit() == patreon.proMaxSongs && player.queue.size >= patreon.proMaxSongs) return msg.edit(`You have reached the **maximum** amount of songs (${patreon.proMaxSongs} songs). Want more songs? Contact the developer: \`Tetra#0001\``);

		let searchQuery = args.join(' ');
		searchQuery = {
			source: 'bandcamp',
			query: args.slice(0).join(' '),
		};
		play(client, message, msg, player, searchQuery, false);

		async function songLimit() {
			const hasPremium = await premium(message.author.id, 'Premium');
			const hasPro = await premium(message.author.id, 'Pro');
			if(!hasPremium && !hasPro) return patreon.defaultMaxSongs;
			if(hasPremium && !hasPro) return patreon.premiumMaxSongs;
			if(hasPremium && hasPro) return patreon.proMaxSongs;
		}
	},
};