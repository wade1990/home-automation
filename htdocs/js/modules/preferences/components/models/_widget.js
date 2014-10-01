define([
    // libs
    'react',
    'morearty',
    // components
    '../common/_buttons_group',
    '../common/_inline_input',
    'mixins/data/data-layer',
    'mixins/sync/sync-layer'
], function (
    // libs
    React,
    Morearty,
    // components
    _buttons_group,
    _inline_input,
    // mixins
    data_layer_mixin,
    sync_layer_mixin
    ) {
    'use strict';

    return React.createClass({
        mixins: [Morearty.Mixin, sync_layer_mixin, data_layer_mixin],
        displayName: '_widget',
        preventDefault: function (e) {
            e.preventDefault();
        },
        handleFile: function(e) {
            this.preventDefault(e);

            var that = this,
                reader = new FileReader(),
                file = e.hasOwnProperty('dataTransfer') ? e.dataTransfer.files[0] : e.target.files[0];

            if (!Boolean(file)) {
                return false;
            }

            reader.onload = function(upload) {
                that.props.model.sub('metrics').set('icon', upload.target.result);
                that.forceUpdate();
            };

            reader.readAsDataURL(file);
        },
        handleClick: function () {
            this.refs.fileInput.getDOMNode().click();
        },
        showInDashboardHandle: function (event) {
            var showInDashboard = event.target.checked,
                activeProfile = this.getActiveProfile(),
                deviceId = this.props.model.val('id'),
                positions = activeProfile.val('positions');

            if (showInDashboard) {
                if (positions.indexOf(deviceId) === -1) {
                    positions.push(deviceId);
                }
            } else {
                positions = positions.filter(function (id) {
                   return id !== deviceId;
                });
            }

            activeProfile.set('positions', positions);

            this.save({
                model: activeProfile,
                serviceId: 'profiles'
            });
        },
        render: function () {
            var that = this,
                cx = React.addons.classSet,
                preferencesBinding = that.getBinding('preferences'),
                dataBinding = that.getBinding('data'),
                _ = React.DOM,
                item = that.props.model,
                id = item.val('id'),
                title = id ? item.val('metrics').title : null,
                icon = id ? item.val('metrics').icon : null,
                deviceType = item.val('deviceType'),
                classes = cx({
                    'preview': true,
                    'placehold': !icon
                });


            return _.div({ className: 'model-component' },
                _.div({ className: 'form-data widget-form adding-status clearfix' },
                    _.div({ key: 'form-id-input', className: 'data-group'},
                        _.span({className: 'label-item'}, 'deviceId'),
                        _.span({className: 'value-item'}, id)
                    ),
                    _.div({ key: 'form-deviceType-input', className: 'data-group'},
                        _.span({className: 'label-item'}, 'deviceType'),
                        _.span({className: 'value-item'}, item.val('deviceType'))
                    ),
                    _.div({ key: 'form-name-input', className: 'form-group' },
                        _.label({ htmlFor: 'room-name', className: 'input-label'}, 'Name:'),
                        _.input({
                            onChange: Morearty.Callback.set(item.sub('metrics'), 'title'),
                            id: 'room-name',
                            className: 'input-value',
                            type: 'text',
                            placeholder: 'Name',
                            value: title
                        })
                    ),
                    _.div({ key: 'form-icon-input', className: 'form-group' },
                        _.label({ htmlFor: 'room-description', className: 'input-label'}, 'Icon:'),
                        _.div({ onDrop: this.handleFile, onDragOver: this.preventDefault, className: 'dropzone', onClick: this.handleClick},
                            _.div({className: 'pull-left text-container'},
                                _.span({ className: 'text-zone primary'}, _.strong({}, 'Drop file'), ' to upload'),
                                _.span({ className: 'text-zone secondary'}, '(or click)')
                            ),
                            _.div({className: classes, style: icon ? {'background-image': 'url(' + icon + ')'} : {}})
                        ),
                        _.input({ref: 'fileInput', className: 'hidden', type: 'file', onChange: this.handleFile})
                    ),
                    _.div({ key: 'form-dashboard-input', className: 'form-group' },
                        _.div({className: 'checkbox-group'},
                            _.input({
                                id: 'showInDashboard',
                                className: 'checkbox-type',
                                type: 'checkbox',
                                name: 'showInDashboard',
                                checked: this.showInDashBoard(id),
                                onChange: this.showInDashboardHandle
                            }),
                            _.label({htmlFor: 'showInDashboard', className: 'input-label'}, 'Show in dashboard')
                        )
                    ),
                    /*
                     _inline_input({
                     binding: {
                     default: preferencesBinding,
                     item: item,
                     items: dataBinding.sub('devices')
                     },
                     sourceId: 'devices',
                     destinationId: 'locations'
                     }),
                     */
                    _buttons_group({
                        binding: {
                            default: preferencesBinding,
                            item: item,
                            items: dataBinding.sub('devices')
                        },
                        model: item,
                        serviceId: this.props.serviceId
                    })
                )
            );
        }
    });
});
