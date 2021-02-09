var THIS_QUARTER;
var discoveryTag ;

Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    
    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    // Add user customizable fields for the Discovery epic label and the Release tag
    //  Rally admin for the org will need to update the release tag each quarter or so
    //  Setting a parameter makes it so the admin doesn't have to change the setting in code.

    getSettingsFields: function() {
        return [
            {
                name: 'Release Tag',
                xtype: 'rallytextfield'
            },
            {
                name: 'Discovery Tag',
                xtype: 'rallytextfield'
            }
        ];
    },

    launch: function() {
        var parentApp = this; 
        THIS_QUARTER = this.getSetting('Release Tag'); 
        discoveryTag = this.getSetting('Discovery Tag'); 
        alert(discoveryTag);

        // Most users generally only care about one train.  Store this in a cookie so that they see the 
        // release train they chose last time as a default.
        var trainPreference =  Ext.util.Cookies.get('TrainPreference');
        if (trainPreference == null){trainPreference = 'TAG:RedTrain'};

        // add the containers and the combo box
        this.add([
            {
                xtype: 'panel',
                
                bodyPadding: 10,
                height: 36,
                itemID: 'topPanel',
                border: false,
                
                items: [{
                    xtype: 'rallycombobox',
                    itemID: 'trainCombo',
                    name: 'trainComboBox',
                    value: trainPreference,
                    defaultSelectionPosition: 'Please select ...',

                    //  Replace these color name pairs with the actual names of your train.  
                    //  First string in the pair is the Rally tag associated with the train
                    //  Second string in the pair is the train name we present to the user in the dropdown
                    store:[
                        ['TAG:RedTrain', 'Red Train'],
                        ['TAG:BlueTrain', 'Blue Train'],
                        ['TAG:YellowTrain', 'Yellow Train'],
                        ['TAG:OrangeTrain', 'Orange Train'],
                        ['TAG:PurpleTrain', 'Purple Train']], 
                    fieldLabel: 'Release Train: ',
                    value: trainPreference,
                    listeners: {
                        // the 'change event seemed like the best choice, but it didn't work for me
                        //  The 'select' event worked perfectly, and is coded below
                        select: function(combobox){                            
                            this._removePriorGrid();
                            this._releaseTrainChange(combobox.getValue());
                            Ext.util.Cookies.set('TrainPreference',combobox.getValue())
                        },
                        scope: this
                    }
                }]

            },  
            {
                // Create a parent container with two side-by-side panels for the discovery and delivery epics
                xtype: 'container',
                itemId: 'epicPanel',
                flex: 1,
                layout: {
                    type: 'hbox',
                    align: 'stretch'
                },
                
                items: [
                    {
                        xtype: 'panel',
                        itemId: 'leftPanel',
                        flex: 1,
                        border: false,
                        bodyPadding: 10
                        
                    },
                    {
                        xtype: 'panel',
                        itemId: 'rightPanel',
                        flex: 1,
                        border: false,
                        bodyPadding: 10
                    }
                ]
                                           
            }
        ])
        
        // set the combobox to default to the cookie value
        this._removePriorGrid();
        this._releaseTrainChange(trainPreference)
    },

    // The dropdown changed, so we need to remove the epics that were previously shown
    _removePriorGrid: function(){
        var epicPanel = Ext.ComponentQuery.query('#epicPanel')[0];

        if (epicPanel.down('#discoveryGrid')!=null) {
            epicPanel.down('#discoveryGrid').destroy();
        };
        if (epicPanel.down('#deliveryGrid')!=null) {
            epicPanel.down('#deliveryGrid').destroy();
        };
        
    },


    // Populate the grids with the user dropdown selection -- first left, then right
    _releaseTrainChange: function (newTrain){                
        this._addDiscoveryGrid(newTrain); // left side panel
        this._addDeliveryGrid(newTrain)   // Right side panel
    }, 

    _addDiscoveryGrid: function(newTrain){
        var discoveryPanel = Ext.ComponentQuery.query('#leftPanel')[0];

        discoveryPanel.add({
            xtype: 'rallygrid',
            itemId: 'discoveryGrid',
            
            columnCfgs: [
                {dataIndex: 'FormattedID', width: 72},
                'Name'
            ],
            title: 'Discovery Epics',
            enableEditing: false,
            defaultSortToRank: true,
            showRowActionsColumn: false,
            showPagingToolbar: false,
            style: 'background-color: #f4d9cd',
            storeConfig: {
                model: 'portfolioitem/epic',
                filters: [{
                    property: 'Tags.Name',
                    operator: 'contains',
                    value: newTrain
                },
                {
                    property: 'Tags.Name',
                    value: this.getSetting('Release Tag')
                },
                {
                    property: 'Tags.Name',
                    value: this.getSetting('Discovery Tag')
                }]
            },
        });

        discoveryPanel.doLayout()
    },

    _addDeliveryGrid: function(newTrain){
        var deliveryPanel = Ext.ComponentQuery.query('#rightPanel')[0];

        deliveryPanel.add({
            xtype: 'rallygrid',
            itemId: 'deliveryGrid',
            
            columnCfgs: [
                {dataIndex: 'FormattedID', width: 72},
                'Name'
            ],
            enableEditing: false,
            title: 'Delivery Epics',
            showRowActionsColumn: false,
            defaultSortToRank: true,
            showPagingToolbar: false,
            style: 'background-color: #f4d9cd',
            storeConfig: {
                model: 'portfolioitem/epic',
                filters: [{
                    property: 'Tags.Name',
                    operator: 'contains',
                    value: newTrain
                },
                {
                    property: 'Tags.Name',
                    value: this.getSetting('Release Tag')
                },
                {
                    property: 'Tags.Name',
                    operator: '!=',
                    value: this.getSetting('Discovery Tag') 
                }]
            },
        });

        deliveryPanel.doLayout()
    },

    readTheSetting: function(){
        
    }

});


