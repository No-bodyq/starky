import { REST } from "@discordjs/rest";
import { ChatInputCommandInteraction, Client } from "discord.js";

import { DiscordServerConfigRepository } from "../../db";

import { assertManageRoles } from "./permissions";

export const handleViewConfigCommand = async (
  interaction: ChatInputCommandInteraction,
  client: Client,
  restClient: REST
) => {
  await assertManageRoles(interaction);
  if (!interaction.guildId) return;
  const selectedRole = interaction.options.getRole("role");
  if (!selectedRole) {
    await interaction.reply({
      content: "You need to select a role.",
      ephemeral: true,
    });
    return;
  }

  const configurations = await DiscordServerConfigRepository.find({
    where: {
      discordServerId: interaction.guildId,
      discordRoleId: selectedRole.id,
    },
    order: { id: "ASC" },
  });
  if (configurations.length === 0) {
    await interaction.reply({
      content: "No configurations found for this role.",
      ephemeral: true,
    });
    return;
  }

  const config = configurations[0];

  await interaction.reply({
    content: `**id:** ${config.id}
**role**: <@&${config.discordRoleId}>
**network:** ${config.starknetNetwork}
**module type:** ${config.starkyModuleType}
${
  config.starkyModuleConfig.contractAddress
    ? `**contract address:** ${config.starkyModuleConfig.contractAddress}\n`
    : ""
}${
      config.starkyModuleConfig.conditionPattern
        ? `**condition pattern (regex):** \`${config.starkyModuleConfig.conditionPattern}\`\n`
        : ""
    }`,
    ephemeral: true,
  });
};
