/* LayersView.js
 * controls updates to the property menu
 */

define([
	'jquery',
	'underscore',
	'paper',
	'backbone',
	'handlebars',
	'fancytree',
	"text!html/layers_ui.html"

], function($, _, paper, Backbone, Handlebars, fancytree, ui) {
	var shapeTree, listTree, shapeRoot, listRoot, source, template, relIcon, refIcon, connector;
	var currentRef, currentRel;
	var shapeSource = [
		/*{
				title: "Shape 1",
				key: "1"
			}, {
				title: "Shape 5",
				key: "7"
			}, {
				title: "Shape 6",
				key: "8"
			}, {
				title: "Shape 2",
				key: "2",
				folder: true,
				children: [{
					title: "Inheritor 1",
					key: "3"
				}, {
					title: "Inheritor 2",
					key: "4"
				}]
			}*/
	];

	var listSource = [
		/*{
				title: "List 1",
				key: "10",
				data: {
					list: true
				}
			}, {
				title: "List 2",
				key: "11",
				data: {
					list: true
				}
			}, {
				title: "List 3",
				key: "12",
				data: {
					list: true
				}
			}, */
	];


	var constraintSource = [
		/*{
				title: 'c1',
				key: '100',
				ref: '1',
				rel: '10',
				status: 'closed'
			}, {
				title: 'c2',
				key: '200',
				ref: '3',
				rel: '5',
				status: 'closed'
			}, {
				title: 'c3',
				key: '300',
				ref: '7',
				rel: '8',
				status: 'pinned'
			}*/
	];
	var LayersView = Backbone.View.extend({

		events: {
			'mousedown.filled': 'argumentClicked',
		},

		initialize: function(obj) {
			this.$el.append(ui);

			source = $('#constraint_template').html();
			template = Handlebars.default.compile(source);
			var view = this;
			this.$('#shapes').fancytree({
				source: [],
				extensions: ["dnd", "edit"],
				collapse: this.treeCollapsed,
				dnd: {
					autoExpandMS: 400,
					focusOnClick: true,
					preventVoidMoves: true, // Prevent dropping nodes 'before self', etc.
					preventRecursiveMoves: true, // Prevent dropping nodes on own descendants
					dragStart: function(node, data) {
						return true;
					},
					dragEnter: function(node, data) {
						return true;
					},
					dragDrop: function(node, data) {
						data.otherNode.moveTo(node, data.hitMode);
						view.dropCompleted(data.otherNode, node, data.hitMode);
					}
				}
			});
			this.$('#lists').fancytree({
				source: [],
				extensions: ["dnd", "edit"],
				expand: this.treeExpanded,
				collapse: this.treeCollapsed,
				dnd: {
					autoExpandMS: 400,
					focusOnClick: true,
					preventVoidMoves: true, // Prevent dropping nodes 'before self', etc.
					preventRecursiveMoves: true, // Prevent dropping nodes on own descendants
					dragStart: function(node, data) {
						return true;
					},
					dragEnter: function(node, data) {
						return true;
					},
					dragDrop: function(node, data) {
						data.otherNode.moveTo(node, data.hitMode);
						view.dropCompleted(data.otherNode, node, data.hitMode);
					}
				}
			});
			shapeTree = $("#shapes").fancytree("getTree");
			listTree = $("#lists").fancytree("getTree");
			$("#shapes").bind('fancytreeexpand', {
				view: this
			}, this.treeExpanded);

			$("#shapes").bind("fancytreecollapse", {
				view: this
			}, this.treeCollapsed);
			$("#lists").bind('fancytreeexpand', {
				view: this
			}, this.treeExpanded);
			$("#lists").bind("fancytreecollapse", {
				view: this
			}, this.treeCollapsed);

			$("#shapes").bind("click", {
				view: this
			}, this.shapeClicked);
			$("#lists").bind("click", {
				view: this
			}, this.listClicked);


			shapeRoot = $("#shapes").fancytree("getRootNode");
			listRoot = $("#lists").fancytree("getRootNode");
			/*shapeRoot.addChildren({
				title: "Shape 3",
				key: 5
			});*/


			var data = {
				constraint: constraintSource
			};
			var html = template(data);

			$('#constraint_list').html(html);
			$('#constraint_list').bind("click", {
				view: this
			}, this.constraintClicked);
			relIcon = $('#constraint_rel');
			refIcon = $('#constraint_ref');

			connector = $('#connector_line');
			this.hideConstraintIcons();
			this.resetConstraintHeight();


		},

		hideConstraintIcons: function() {
			relIcon.css({
				visibility: 'hidden'
			});
			refIcon.css({
				visibility: 'hidden'
			});
			connector.css({
				visibility: 'hidden'
			});
		},

		positionConstraintIcons: function(checkVisible) {
			this.deselectAllNodes();
			if (currentRef && currentRel) {
				var ref = shapeTree.getNodeByKey(currentRef);
				var rel = shapeTree.getNodeByKey(currentRel);

				if (!ref) {
					ref = listTree.getNodeByKey(currentRef);
				}
				if (!rel) {
					rel = listTree.getNodeByKey(currentRel);
				}
				ref.setSelected();
				rel.setSelected();
				if (!rel.isVisible() && !checkVisible) {
					var view = this;
					rel.makeVisible().done(function() {
						view.positionRef(rel, ref);
					});
				} else {
					if (checkVisible) {
						this.hideConstraintIcons();

					} else {
						this.positionRef(rel, ref, checkVisible);
					}
				}
			} else {
				this.hideConstraintIcons();
			}
		},

		positionRef: function(rel, ref, checkVisible) {
			if (!ref.isVisible() && !checkVisible) {
				var view = this;
				ref.makeVisible().done(function() {
					view.styleIcons(rel, ref);
				});
			} else {
				if (checkVisible) {
					this.hideConstraintIcons();

				} else {
					this.styleIcons(rel, ref);
				}
			}
		},

		styleIcons: function(rel, ref) {
			var p1 = $(rel.span).offset();
			var p2 = $(ref.span).offset();
			var bc1 = $(rel.span).css('backgroundColor');
			var bc2 = $(ref.span).css('backgroundColor');
			console.log("shapeRoot, listRoot", p1.top, p2.top);
			$('#constraint_rel').css({
				top: Math.floor(p1.top) - 1,
				backgroundColor: bc1,
				visibility: 'visible'
			});
			$('#constraint_ref').css({
				top: Math.floor(p2.top) - 1,
				backgroundColor: bc2,
				visibility: 'visible'
			});
			var length = Math.abs(p1.top - p2.top);
			var connectorTop = p1.top < p2.top ? p1.top : p2.top;
			$('#connector_line').css({
				height: length,
				top: connectorTop + 15,
				visibility: 'visible'
			});
		},

		treeExpanded: function(event) {
			event.data.view.resetConstraintHeight();
		},

		treeCollapsed: function(event) {
			event.data.view.resetConstraintHeight();
			event.data.view.positionConstraintIcons(true);
		},

		resetConstraintHeight: function() {
			var height = $('div#layers').outerHeight();
			console.log('height=', height, $('div#layers'));
			$('#constraint_viz').height(height);

		},

		deselectAllNodes: function() {
			var selectedNodes = shapeTree.getSelectedNodes();
			selectedNodes = selectedNodes.concat(listTree.getSelectedNodes());
			selectedNodes.forEach(function(item) {
				item.setSelected(false);
			});
		},

		setLayerActive: function(instanceId, layerId) {

		},

		constraintClicked: function(event) {
			var id = event.target.id;
			console.log('clicked constraint', id);
			var constraint = constraintSource.filter(function(item) {
				console.log(item);
				item.status = 'closed';
				return item.key == id;
			})[0];
			constraint.status = 'opened';
			currentRef = constraint.ref;
			currentRel = constraint.rel;

			var html = template({
				constraint: constraintSource
			});
			$('#constraint_list').html(html);
			console.log(event.data.view);
			event.data.view.positionConstraintIcons();

		},

		dropCompleted: function(nodeA, nodeB, hitMode) {
			console.log('dropCompleted', nodeA, nodeB, hitMode);
			this.model.reorderShapes(nodeA.key, nodeB.key, hitMode);
		},

		shapeClicked: function(event) {

			var id = event.target.id;
			var classes = event.target.className.split(/\s+/);
			var activeNode = shapeTree.getActiveNode();
			switch (id) {
				case 'constraint':
					break;
				case 'visible':
					event.data.view.toggleVisibility(activeNode, classes);
					break;
			}
		},

		listClicked:function(event){

		},

		toggleVisibility: function(activeNode, classes) {
			if (!_.contains(classes, 'hidden')) {
				$(event.target).addClass('hidden');
			} else {
				console.log('removing class');
				$(event.target).removeClass('hidden');
			}
			this.model.toggleShapeVisibility(activeNode.key);
		},

		addShape: function(shape) {
			console.log('shape', shape);
			var s = {
				title: shape.name,
				key: shape.id
			};
			shapeRoot.addChildren(s);
			this.resetConstraintHeight();

		},

		addInstance: function(shape, pId) {
			var parentNode = shapeTree.getNodeByKey(pId);
			if (parentNode) {
				var s = {
					title: shape.name,
					key: shape.id
				};
				var node = parentNode.addChildren(s);
				this.resetConstraintHeight();
			}
		},

		addList: function(list) {
			console.log('list', list);
			var listData = {
				title: list.name,
				key: list.id,
				data: {
					list: true
				}
			};
			var listNode = listRoot.addChildren(listData);

		},

		addConstraint: function(data){
			console.log('adding constraint',data);
		}



	});
	return LayersView;
});