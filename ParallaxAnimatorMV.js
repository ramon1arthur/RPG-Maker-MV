/*:
 * @target RPG Maker MV
 * @plugindesc Permite adicionar múltiplas imagens de parallax com animação e controle de delay no RPG Maker MV.
 * @author An01
 *
 * @help ParallaxAnimatorMV.js
 *
 * Este plugin permite adicionar várias imagens de parallax para um mapa no RPG Maker MV
 * e alterná-las com um delay configurável, simulando uma animação.
 *
 * Para usar, insira o seguinte no campo "Notas" do mapa:
 *
 * <ParallaxImages: imagem1, imagem2, imagem3>
 * <ParallaxDelay: 60>
 *
 * Substitua "imagem1", "imagem2", "imagem3" pelos nomes das imagens do parallax (sem extensão).
 * <ParallaxDelay: 60> define o tempo (em frames) para trocar as imagens.
 *
 * Exemplo:
 * <ParallaxImages: forest1, forest2, forest3>
 * <ParallaxDelay: 45>
 *
 * As imagens devem estar na pasta "img/parallaxes".
 *
 * @param DefaultDelay
 * @type number
 * @min 1
 * @default 60
 * @desc Tempo padrão (em frames) para alternar as imagens, se não especificado nas notas do mapa.
 */

(function() {
    const pluginName = "ParallaxAnimatorMV";

    const parameters = PluginManager.parameters(pluginName);
    const defaultDelay = Number(parameters["DefaultDelay"] || 60);

    // Extende a classe Game_Map para adicionar suporte ao parallax animado
    const _Game_Map_setup = Game_Map.prototype.setup;
    Game_Map.prototype.setup = function(mapId) {
        _Game_Map_setup.call(this, mapId);
        this.setupParallaxAnimation();
    };

    Game_Map.prototype.setupParallaxAnimation = function() {
        this._parallaxImages = [];
        this._parallaxDelay = defaultDelay;
        this._currentParallaxIndex = 0;
        this._parallaxTimer = 0;

        const map = $dataMap;
        if (!map) return;

        // Lê as notas do mapa
        const parallaxImagesMatch = map.note.match(/<ParallaxImages:\s*([^>]+)>/i);
        const parallaxDelayMatch = map.note.match(/<ParallaxDelay:\s*(\d+)>/i);

        if (parallaxImagesMatch) {
            this._parallaxImages = parallaxImagesMatch[1]
                .split(",")
                .map(image => image.trim());
        }

        if (parallaxDelayMatch) {
            this._parallaxDelay = Number(parallaxDelayMatch[1]) || defaultDelay;
        }
    };

    const _Game_Map_update = Game_Map.prototype.update;
    Game_Map.prototype.update = function(sceneActive) {
        _Game_Map_update.call(this, sceneActive);

        if (this._parallaxImages.length > 1) {
            this._parallaxTimer++;
            if (this._parallaxTimer >= this._parallaxDelay) {
                this._parallaxTimer = 0;
                this._currentParallaxIndex = (this._currentParallaxIndex + 1) % this._parallaxImages.length;
                this.refreshParallax();
            }
        }
    };

    Game_Map.prototype.refreshParallax = function() {
        if (this._parallaxImages.length > 0) {
            const currentImage = this._parallaxImages[this._currentParallaxIndex];
            this._parallaxName = currentImage || "";
        }
    };

    const _Spriteset_Map_createLowerLayer = Spriteset_Map.prototype.createLowerLayer;
    Spriteset_Map.prototype.createLowerLayer = function() {
        _Spriteset_Map_createLowerLayer.call(this);
        $gameMap.refreshParallax();
        //AN01
    };
})();
