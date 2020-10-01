/*----------------------------------------------------------------------------------------------------*/
var Aunwakmlkmz = function () {
    this.overlays = [];
}
Aunwakmlkmz.prototype = new google.maps.OverlayView();
Aunwakmlkmz.prototype.addOverlay = function (overlay) {
    /* this.overlays.push(overlay); */
    this.overlays = [overlay, ...this.overlays];
};
Aunwakmlkmz.prototype.removeOverlay = function (name) {
    let update = this.overlays.filter(item => item.name != name);
    let del = this.overlays.filter(item => item.name == name);
    console.log(del)
    del[0].setMap(null);
    this.overlays = update;
    console.log(this.overlays)

};
Aunwakmlkmz.prototype.updateOverlays = function () {
    for (var i = 0; i < this.overlays.length; i++) {
        this.overlays[i].setMap(this.getMap());

    }
};
Aunwakmlkmz.prototype.draw = function () { };
Aunwakmlkmz.prototype.onAdd = Aunwakmlkmz.prototype.updateOverlays;
Aunwakmlkmz.prototype.onRemove = Aunwakmlkmz.prototype.updateOverlays;
/*-----------------------------------------------------------------------------------------------*/