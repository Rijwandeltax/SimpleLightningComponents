({
    fetchSearchResults : function(component, event, helper) {
        var searchText = event && event.target ? event.target.value : null;
        //Escape button pressed
        if(event.keyCode == 27) {
            helper.clearSelection(component, event, helper);
        } else {
            var action = component.get('c.search');
            action.setParams({
                parentSObjectName    : component.get('v.parentSObjectName'),
                searchFieldName      : component.get('v.searchFieldName'),
                searchText           : searchText,
                displayTextFieldName : component.get('v.displayTextFieldName'),
                limitCount           : component.get('v.limitCount')
            });
            action.setStorable();
            action.setCallback(this, function(response) {
                this.handleResponse(response, component, helper);
            });

            console.log('Server call made');
            $A.enqueueAction(action);
        }
    },
    itemSelected : function(component, event, helper) {
        var selectedRecordIndex = helper.getIndexFrmParent(event.target, helper, 'data-selectedIndex');
        if(selectedRecordIndex) {
            var serverResult = component.get('v.searchResults');
            var childRecord = component.get('v.childRecord');
            var childRecordLookupFieldName = component.get('v.childRecordLookupFieldName');
            var selectedRecord = serverResult[selectedRecordIndex];
            console.log('selectedRecord');
            console.log(selectedRecord);
            if(selectedRecord.record) {
                childRecord[childRecordLookupFieldName] = selectedRecord.record.Id;
                component.set('v.selectedRecord', selectedRecord);
            }
            component.set('v.searchResults', null);
        }
    },
    clearSelection: function(component, event, helper) {
        component.set('v.selectedRecord', null);
        component.set('v.searchResults', null);
    },
    handleResponse : function (response,component,helper) {
        if(response.getState() === 'SUCCESS') {
            var retObj = JSON.parse(response.getReturnValue());
            if(retObj.length <= 0) {
                component.set('v.searchResults', null);
            } else {
                component.set('v.searchResults', retObj);
            }
        } else if(response.getState() === 'ERROR') {
            var errors = response.getError();
            if(errors && errors[0] && errors[0].message) {
                alert(errors[0].message);
            }
        }
    },
    getIndexFrmParent : function(target, helper, attributeToFind) {
        //User can click on any child element, so traverse till intended parent found
        var selectedRecordIndex = target.getAttribute(attributeToFind);
        while(!selectedRecordIndex) {
            target = target.parentNode;
            selectedRecordIndex = helper.getIndexFrmParent(target, helper, attributeToFind);
        }
        return selectedRecordIndex;
    }
})