Y.PieSeries = Y.Base.create("pieSeries", Y.Widget, [Y.Renderer], {
    /**
     * @private
     */
    renderUI: function()
    {
        this._setCanvas();
    },
    
    /**
     * @private
     */
    bindUI: function()
    {
        var categoryAxis = this.get("categoryAxis"),
            valueAxis = this.get("valueAxis");
        if(categoryAxis)
        {
            categoryAxis.after("axisReady", Y.bind(this._categoryAxisChangeHandler, this));
            categoryAxis.after("axisUpdate", Y.bind(this._categoryAxisChangeHandler, this));
        }
        if(valueAxis)
        {
            valueAxis.after("axisReady", Y.bind(this._valueAxisChangeHandler, this));
            valueAxis.after("axisUpdate", Y.bind(this._valueAxisChangeHandler, this));
        }
        this.after("categoryAxisChange", Y.bind(this.categoryAxisChangeHandler, this));
        this.after("valueAxisChange", Y.bind(this.valueAxisChangeHandler, this));
        this.after("stylesChange", Y.bind(this._updateHandler, this));
    },
   
    /**
     * @private
     */
    syncUI: function()
    {
        this.draw();
    },

    /**
     * @private
     */
    _updateHandler: function(e)
    {
        if(this.get("rendered"))
        {
            this.draw();
        }
    },

	/**
	 * Constant used to generate unique id.
	 */
	GUID: "pieseries",
	
	/**
	 * @private (protected)
	 * Handles updating the graph when the x < code>Axis</code> values
	 * change.
	 */
	_categoryAxisChangeHandler: function(event)
	{
        if(this.get("rendered") && this.get("categoryKey") && this.get("valueKey"))
		{
			this.draw();
		}
	},

	/**
	 * @private (protected)
	 * Handles updating the chart when the y <code>Axis</code> values
	 * change.
	 */
	_valueAxisChangeHandler: function(event)
	{
        if(this.get("rendered") && this.get("categoryKey") && this.get("valueKey"))
		{
			this.draw();
		}
	},
    
	/**
	 * @private (override)
	 */
	draw: function()
    {
        var node = Y.Node.one(this._parentNode).get("parentNode"),
			w = node.get("offsetWidth"),
            h = node.get("offsetHeight");
        if  (!isNaN(w) && !isNaN(h) && w > 0 && h > 0)
		{
            this.drawSeries();
		}
	},
    
    /**
     * @private
     */
	drawSeries: function()
    {
        var values = this.get("valueAxis").getDataByKey(this.get("valueKey")).concat(),
            categories = this.get("categoryAxis").getDataByKey(this.get("categoryKey")).concat(),
            totalValue = 0,
            itemCount = values.length,
            styles = this.get("styles"),
            fillColors = styles.fillColors,
            fillAlphas = styles.fillAlphas || ["1"],
            borderColors = styles.borderColors,
            borderWeights = styles.borderWeights,
            borderAlphas = styles.borderAlphas,
            tbw = borderWeights.concat(),
            tbc = borderColors.concat(),
            tba = borderAlphas.concat(),
            tfc,
            tfa,
            padding = styles.padding,
            node = Y.Node.one(this._parentNode).get("parentNode"),
			w = node.get("offsetWidth") - (padding.left + padding.right),
            h = node.get("offsetHeight") - (padding.top + padding.bottom),
            totalAngle = 0,
            halfWidth = w / 2,
            halfHeight = h / 2,
            radius = Math.min(halfWidth, halfHeight),
            i = 0,
            value,
            angle = 0,
            graphic = this.get("graphic"),
            lc,
            la,
            lw;

        graphic.setSize(w, h);
        graphic.setPosition(padding.left, padding.top);
        for(; i < itemCount; ++i)
        {
            value = values[i];
            
            values.push(value);
            if(!isNaN(value))
            {
                totalValue += value;
            }
        }
        
        
        graphic.clear();
        tfc = fillColors.concat();
        tfa = fillAlphas.concat();
        for(i = 0; i < itemCount; i++)
        {
            value = values[i];
            if(totalValue === 0)
            {
                angle = 360 / values.length;
            }
            else
            {
                angle = 360 * (value / totalValue);
            }
            angle = Math.round(angle);
            if(tfc.length < 1)
            {
                tfc = fillColors.concat();
            }
            if(tfa.length < 1)
            {
                tfa = fillAlphas.concat();
            }
            if(tbw.length < 1)
            {
                tbw = borderWeights.concat();
            }
            if(tbc.length < 1)
            {
                tbc = borderColors.concat();
            }
            if(tba.length < 1)
            {
                tba = borderAlphas.concat();
            }
            lw = tbw.shift();
            lc = tbc.shift();
            la = tba.shift();
            if(lw > 0)
            {
                graphic.lineStyle(lw, lc, la);
            }
            graphic.beginFill(tfc.shift(), tfa.shift());
            graphic.drawWedge(halfWidth, halfHeight, totalAngle, angle, radius);
            totalAngle += angle;    
        }
        graphic.end();
    },

    /**
     * @private
     * @return Default styles for the widget
     */
    _getDefaultStyles: function()
    {
        return {
            padding:{
                top: 0,
                left: 0,
                right: 0,
                bottom: 0
            },
            fillColors:[
				"#00b8bf", "#8dd5e7", "#c0fff6", "#ffa928", "#edff9f", "#d00050",
				"#c6c6c6", "#c3eafb", "#fcffad", "#cfff83", "#444444", "#4d95dd",
				"#b8ebff", "#60558f", "#737d7e", "#a64d9a", "#8e9a9b", "#803e77"
            ],
            fillAlphas:["1"],
            borderColors:["#000000"],
            borderWeights:["0"],
            borderAlphas:["1"]
        };
    }
},{	
ATTRS: {

	type: {		
  	    value: "pie"
    },
	/**
	 * Order of this ISeries instance of this <code>type</code>.
	 */
	order: {
	    value:NaN
    },
	graph: {
        value: null
	},
	/**
	 * Reference to the <code>Axis</code> instance used for assigning 
	 * x-values to the graph.
	 */
	categoryAxis: {
		value: null,

        validator: function(value)
		{
			return value !== this.get("categoryAxis");
		},
		
        lazyAdd: false
	},
	
	valueAxis: {
		value: null,

        validator: function(value)
		{
			return value !== this.get("valueAxis");
		},
		
        lazyAdd: false
    },
	/**
	 * Indicates which array to from the hash of value arrays in 
	 * the category <code>Axis</code> instance.
	 */
	categoryKey: {
        value: null,

		validator: function(value)
		{
			return value !== this.get("categoryKey");
		}
	},
	/**
	 * Indicates which array to from the hash of value arrays in 
	 * the value <code>Axis</code> instance.
	 */
	valueKey: {
		value: null,

        validator: function(value)
		{
			return value !== this.get("valueKey");
		}
	},

    slices: null
}
});

