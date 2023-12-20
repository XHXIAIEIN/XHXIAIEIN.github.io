


const scriptsInEvents = {

	async Main_Event30_Act1(runtime, localVars)
	{
		const {token, items} = localVars;
		const index = items.split(',').map((item, index) => item.trim() === token ? index : -1).filter(index => index !== -1);
		runtime.setReturnValue(index);
	},

	async Main_Event31_Act1(runtime, localVars)
	{
		const { token, items } = localVars;
		const itemString = typeof items === 'string' ? items : '';
		const exists = itemString.split(',').some(item => item.trim() === token);
		runtime.setReturnValue(exists);
	},

	async Localstorage_Event24_Act1(runtime, localVars)
	{
		const { size, data } = JSON.parse(localVars.c3ArrayFile);
		const [, totalRows] = size;
		
		const columnHeaders = data.map(column => column[0][0].trim());
		const output = [];
		
		for (let rowIndex = 1; rowIndex < totalRows; rowIndex++) {
		  const rowObject = Object.fromEntries(
		    columnHeaders.map((header, columnIndex) => {
		      const cellValue = data[columnIndex][rowIndex][0];
		      return [header, (typeof cellValue === 'string' ? cellValue.trim() : cellValue) || ""];
		    })
		  );
		
		  const isEmptyRow = Object.values(rowObject).every(value => value === "");
		
		  if (!isEmptyRow) {
		    output.push(rowObject);
		  }
		}
		
		output.forEach(item => {
		  if (item.hasOwnProperty('ItemID')) {
		    item.ItemID = String(item.ItemID);
		  }
		});
		
		runtime.setReturnValue(JSON.stringify(output));
	},

	async Localstorage_Event25_Act1(runtime, localVars)
	{
		const cookbookData = JSON.parse(localVars.c3convertJSON);
		
		const cookbookObject = cookbookData.reduce((acc, recipe) => {
		    const { ItemID, Ingredient1, Ingredient2, Ingredient3, Ingredient4, Ingredient5, ...rest } = recipe;
		
		    const ingredients = [Ingredient1, Ingredient2, Ingredient3, Ingredient4, Ingredient5].filter(ingredient => ingredient !== "");
		
		    if (ItemID !== undefined) {
		        const recipeObject = { ItemID, Ingredients: ingredients, ...rest };
		        const filteredRecipe = Object.fromEntries(Object.entries(recipeObject).filter(([_, value]) => value !== undefined));
		        acc[ItemID] = filteredRecipe;
		    }
		    return acc;
		}, {});
		
		runtime.setReturnValue(JSON.stringify(cookbookObject));
	},

	async Localstorage_Event26_Act1(runtime, localVars)
	{
		const cookbookData = JSON.parse(localVars.c3convertJSON);
		const itemsData = runtime.objects.ItemsData.getFirstInstance().getJsonDataCopy();
		
		const getIngredientId = (ingredientName) => (itemsData.find(item => item.Name === ingredientName) || {}).ItemID || ingredientName;
		
		const cookFormula = cookbookData.map(({ ItemID, Ingredient1, Ingredient2, Ingredient3, Ingredient4, Ingredient5, Mixing, Method }) => {
		
		  // 获取食谱中的原始配料数组
		  const rawIngredients = [Ingredient1, Ingredient2, Ingredient3, Ingredient4, Ingredient5].filter(Boolean).map(getIngredientId);
		
		  // 使用 reduce 方法创建配料计数映射
		  const ingredientCounts = rawIngredients.reduce((counts, ingredient) => {
		    counts[ingredient] = (counts[ingredient] || 0) + 1;
		    return counts;
		  }, {});
		
		  return { ItemID, Ingredients: ingredientCounts, Mixing, Method };
		});
		
		runtime.setReturnValue(JSON.stringify(cookFormula));
		
	},

	async Data_Event3_Act1(runtime, localVars)
	{
		const itemsData = runtime.objects.ItemsData.getFirstInstance().getJsonDataCopy();
		const playerData = runtime.objects.PlayerData.getFirstInstance().getJsonDataCopy();
		const { Ingredients } = playerData;
		const { category, level } = localVars;
		
		const filteredItems = itemsData.filter(({ ItemID, Category, UnlockLevel, ShopStock, isUnique }) => 
		    Category === category &&
		    UnlockLevel <= level &&
		    (typeof ShopStock === 'number' ? ShopStock > 0 : ShopStock === '') &&
		    (!isUnique || !(ItemID in Ingredients))
		);
		
		const filteredItemsData = {
		    category,
		    items: filteredItems
		};
		
		runtime.objects.AvailableItems.getFirstInstance().setJsonDataCopy(filteredItemsData);
	},

	async Data_Event5_Act1(runtime, localVars)
	{
		const { itemID, itemKey } = localVars;
		if (itemKey === "ItemStock") {
			const playerData = runtime.objects.PlayerData.getFirstInstance().getJsonDataCopy();
			const ingredients = playerData.Ingredients || {};
			const stock = ingredients[itemID] || 0;
			runtime.setReturnValue(stock);
		} else {
			const itemsData = runtime.objects.ItemsData.getFirstInstance().getJsonDataCopy();
			const itemData = itemsData.find(item => item.ItemID === itemID) || {};
			let data = itemData ? itemData[itemKey] : "None";
			runtime.setReturnValue(data);
		}
	},

	async Data_Event6_Act1(runtime, localVars)
	{
		const itemsData = runtime.objects.ItemsData.getFirstInstance().getJsonDataCopy();
		const itemID = localVars.itemID;
		const itemData = itemsData.find(item => item.ItemID === itemID) || {};
		runtime.setReturnValue(JSON.stringify(itemData));
	},

	async Data_Event7_Act1(runtime, localVars)
	{
		const { category, filterItemStock, filterEmptyItems } = localVars;
		
		const ingredients = runtime.objects.InventoryData.getFirstInstance().getJsonDataCopy()[category] || {};
		const ingredientValues = Object.values(ingredients);
		
		const result = 
		  filterItemStock ? ingredientValues.reduce((sum, value) => sum + value, 0) : 
		  filterEmptyItems ? ingredientValues.filter(value => value > 0).length : 
		  ingredientValues.length;
		
		runtime.setReturnValue(result);
	},

	async Data_Event9_Act1(runtime, localVars)
	{
		// 获取食谱数据
		const cookFormula = runtime.objects.CookFormula.getFirstInstance().getJsonDataCopy();
		
		// 获取参数
		const { formula, filterMixing, filterMethod } = localVars;
		
		// 解析配方字符串为对象
		const parsedFormula = JSON.parse(formula);
		
		// 查找匹配的食谱
		const matched = cookFormula.filter(recipe => {
		
		    // 检查配料是否匹配
		    const ingredientsMatch = Object.entries(parsedFormula.Ingredient).every(([ingredient, quantity]) => {
		        return recipe.Ingredients[ingredient] === quantity;
		    }) && Object.keys(recipe.Ingredients).length === Object.keys(parsedFormula.Ingredient).length;
		
		    // 检查搅拌和烹饪方法是否匹配
		    const mixingMatch = recipe.Mixing === parsedFormula.Mixing;
		    const methodMatch = recipe.Method === parsedFormula.Method;
		
		    return ingredientsMatch && mixingMatch && methodMatch;
		});
		
		// 匹配结果的 ItemID 数组
		let matchedRecipeItemIDs = [];
		
		if (filterMixing === 0 && filterMethod === 0) {
		    matchedRecipeItemIDs = matched.length === 1 ? [matched[0].ItemID] : [];
		} else {
		    matchedRecipeItemIDs = matched.map(recipe => recipe.ItemID);
		}
		
		// 返回匹配结果
		runtime.setReturnValue(JSON.stringify(matchedRecipeItemIDs));
	},

	async Data_Event26_Act1(runtime, localVars)
	{
		const playerData = runtime.objects.PlayerData.getFirstInstance().getJsonDataCopy();
		const itemsData = runtime.objects.ItemsData.getFirstInstance().getJsonDataCopy();
		
		const output = {};
		
		for (const [itemID, itemStock] of Object.entries(playerData.Ingredients || {})) {
		
		    // 直接通过映射获取物品数据
		    const itemData = itemsData.find(item => item.ItemID === itemID);
		
		    // 确定物品分类，如果没有找到则归类为'其他'
		    const category = itemData ? itemData.Category : "其他";
		
		    // 使用逻辑短路运算符初始化分类数据结构
		    output[category] = output[category] || {};
		
		    // 将物品及其数量添加到相应分类
		    output[category][itemID] = itemStock;
		}
		
		// 将分类后的库存数据作为返回值
		runtime.objects.InventoryData.getFirstInstance().setJsonDataCopy(output);
	}

};

self.C3.ScriptsInEvents = scriptsInEvents;

