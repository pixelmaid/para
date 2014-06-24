/* SceneNode.js 
* base class for node in scene graph
*
*/

define ([
  'underscore',
  'backbone'

], function(_, Backbone) {
       

 	var SceneNode = Backbone.Model.extend({	
        defaults: {
            type: 'default',
            name:'',
            parent: {exists:false,name:''}
            
        },
 		
    constructor: function(){
       this.parent = null;
       this.children= [];
 		//console.log("name="+name);
 		
 		//console.log("parent="+node.name);
 		
 		SceneNode.numNodeInstances++;
        Backbone.Model.apply(this, arguments);
 		//console.log("number of nodes="+SceneNode.numNodeInstances);
    },

    initialize: function(){

    },
/*================ SceneNode method defintions ================*/

//destructor: clears all this.children and sets parent to null
		clear: function(){
         
    		console.log('clear called');
    		this.parent=null;
    		for(var i =0; i<this.children.length;i++){
    			console.log('clearning child of '+this.name+'at:'+i);
    			this.children[i].clear();
    		  this.children[i] = null;
    		}

    		//this.children.clear();
    		return true;


    	},

//returns parent node
   		getParentNode: function(){
            
            if(this.parent!==null){
                return this.parent;
            }
            else{
                return null;
            }
    	},

//returns this.children array
        getChildren: function(){
            return this.children;
        },
//returns other nodes with the same parent
        getSiblings: function(){
            return this.parent.getChildren();
        },

//returns child at specified index 
        getChildAt: function(index){
           
            if(this.children.length>index){
                return this.children[index];
            }
            return null;
        },

//returns number of this.children        
        getNumChildren: function(){
           return this.children.length;
        },

//sets parent node. 
//If node already has a parent, it removes itself from the parent's this.children
        setParentNode: function(node){
            console.log('parent='+this.parent);
            if(node!==null){
                if(this.parent!== null){
                    this.parent.removeChildNode(this);
                }
                this.parent = node;
                this.set('parent',{exists:true,name:this.parent.get('name')});
                return true;
            }
            return false;
        },

        removeParentNode: function(){
            
            
                if(this.parent!== null){
                    this.parent =null;
                this.set('parent',{exists:false,name:''});
                return true;

            }
            return false;
        },
//adds new child and sets child parent to this
        addChildNode: function(node){
            
            if(node !==null){
                node.setParentNode(this);
                this.children.push(node);
                return true;
            }

            return false;

        },
//removes child node from list of this.children- does not delete the removed child!
        removeChildNode: function(node){
           // console.log("number of this.children="+this.children.length);
            if(node!==null && this.children.length>0){
               // console.log("attempting to remove");
                for(var i = 0; i < this.children.length; i++){
                  
                    if(this.children[i] == node){
                        this.children[i].removeParentNode();
                        this.children.splice(i,1);
                        return true;

                    }
                }
            }
            return false;
        },

//recursively searches all sub this.children for child to remove- depth first. Not very efficient. double check to see if this is actually working correctly...
        recursiveRemoveChildNode: function(node){
           //console.log("starting recurse at node:"+this.name);
            if(node!== null && this.children.length>0){
                for(var i = 0; i < this.children.length; i++){
                   // console.log("-----checking child at:"+i);
                    if(this.children[i] == node){
                        this.children.splice(i,1);
                        console.log('found node to remove at parent:'+this.name+' , index:'+i);
                        return true;
                    }
                    else{
                      
                        if(this.children[i].recursiveRemoveChildNode(node)){
                            return true;
                        }
                    }
                }
            }
            return false;
        },

       //TODO: copies itself and returns the copy

        copy: function(){},

        //recursively updates all child nodes. placeholder for geometric update functions in subclasses
        update: function(){
            console.log('updating:'+this.get('name'));
            if(this.children.length>0){
                for(var i=0; i<this.children.length;i++){
                    if(this.children[i]!==null){
                        this.children[i].update();
                    }
                }
            }

            this.trigger('change:update');

        },




	});




    //static var for keeping track of total number of nodes across the graph
    SceneNode.numNodeInstances =0;



	return SceneNode;

});