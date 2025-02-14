function calcOverlappingArea({ player, battleZone }) {
    const overlappingWidth =
        Math.min(
            battleZone.position.x + battleZone.width,
            player.position.x + player.width
        ) - Math.max(battleZone.position.x, player.position.x)
    const overlappingHeight =
        Math.min(
            battleZone.position.y + battleZone.height,
            player.position.y + player.height
        ) - Math.max(battleZone.position.y, player.position.y)
    const overlappingArea = overlappingHeight * overlappingWidth
    return overlappingArea
}