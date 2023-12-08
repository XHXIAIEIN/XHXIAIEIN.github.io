


const scriptsInEvents = {

	async Main_Event25_Act1(runtime, localVars)
	{
		const {token, items} = localVars;
		const index = items.split(',').map((item, index) => item.trim() === token ? index : -1).filter(index => index !== -1);
		runtime.setReturnValue(index);
	},

	async Main_Event26_Act1(runtime, localVars)
	{
		const { token, items } = localVars;
		const itemString = typeof items === 'string' ? items : '';
		const exists = itemString.split(',').some(item => item.trim() === token);
		runtime.setReturnValue(exists);
	},

	async Localstorage_Event9_Act1(runtime, localVars)
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
		
		  const commentValue = data[0][rowIndex][0];
		  const isCommentRow = Object.values(rowObject).every(value => value === "");
		
		  // 检查行是否为注释行或全为空，如果是则跳过
		  if (!isCommentRow && typeof commentValue === 'string' && !commentValue.includes("::")) {
		    output.push(rowObject);
		  }
		}
		
		runtime.setReturnValue(JSON.stringify(output));
	},

	async Localstorage_Event10_Act1(runtime, localVars)
	{
		let cookbookData = JSON.parse(localVars.c3convertJSON);
		
		const cookFormula = cookbookData.map(item => {
		  const { ItemID, Name, Ingredient1, Ingredient2, Ingredient3, Ingredient4, Ingredient5, Mixing, Method } = item;
		  const ingredients = [Ingredient1, Ingredient2, Ingredient3, Ingredient4, Ingredient5].filter(Boolean);
		  return { ItemID, Name, Ingredients: ingredients, Mixing, Method };
		});
		
		runtime.setReturnValue(JSON.stringify(cookFormula));
	},

	async Data_Event3_Act1(runtime, localVars)
	{
		const playerData = runtime.objects.PlayerData.getFirstInstance().getJsonDataCopy();
		const itemsData = runtime.objects.ItemsData.getFirstInstance().getJsonDataCopy();
		const ingredients = playerData.Ingredients || {};
		
		const { category, level } = localVars;
		
		const filterItems = {
		    category: category,
		    items: itemsData.filter(({ ItemID, Category, UnlockLevel, ShopStock, isUnique }) => 
		        Category === category && UnlockLevel <= level &&
		        (typeof ShopStock === 'number' ? ShopStock > 0 : ShopStock === '') &&
		        (!isUnique || !(ItemID in ingredients)) 
		    )
		};
		
		runtime.setReturnValue(JSON.stringify(filterItems));
	},

	async Data_Event21_Act1(runtime, localVars)
	{
		const playerData = runtime.objects.PlayerData.getFirstInstance().getJsonDataCopy();
		const itemsData = runtime.objects.ItemsData.getFirstInstance().getJsonDataCopy();
		
		let output = {};
		
		for (let itemID in playerData.Ingredients) {
		
		    // 查找对应的物品数据
		    let itemData = itemsData.find(item => item.ItemID === itemID);
			
		    // 确定物品分类，如果没有找到则归类为'其他'
		    let category = itemData ? itemData.Category : "其他"; 
		
		    // 确保该分类的数据结构已初始化
		    output[category] = output[category] || {};
			
		    // 将物品及其数量添加到相应分类
		    output[category][itemID] = playerData.Ingredients[itemID];
		}
		
		// 将分类后的库存数据作为返回值
		runtime.setReturnValue(JSON.stringify(output));
	},

	async Data_Event22_Act1(runtime, localVars)
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

	async Data_Event23_Act1(runtime, localVars)
	{
		const itemsData = runtime.objects.ItemsData.getFirstInstance().getJsonDataCopy();
		const itemID = localVars.itemID;
		const itemData = itemsData.find(item => item.ItemID === itemID) || null;
		runtime.setReturnValue(JSON.stringify(itemData));
	},

	async Data_Event24_Act1(runtime, localVars)
	{
		const { category, filterItemStock, filterEmptyItems } = localVars;
		const ingredients = runtime.objects.Inventory.getFirstInstance().getJsonDataCopy()[category] || {};
		
		const result = filterItemStock ? Object.values(ingredients).reduce((sum, value) => sum + value, 0) // 计算库存总量
		: filterEmptyItems ? Object.values(ingredients).filter(value => value > 0).length // 计算非空项数量
		: Object.keys(ingredients).length; // 计算总项数
		
		runtime.setReturnValue(result);
	},

	async Data_Event25_Act1(runtime, localVars)
	{
		const categoryIconMap = {
			"原料": "iconMaterial",
			"天然": "iconMaterial",
			"半成品": "iconFood",
			"成品": "iconFood",
			"家具": "iconFurniture",
			"工具": "iconFurniture",
			"动物": "iconAnimal"
		};
		
		const objectTypeName = categoryIconMap[localVars.category] || "iconMaterial";
		runtime.setReturnValue(objectTypeName);
	},

	async Data_Event27_Act1(runtime, localVars)
	{
		// 获取 CookFormula 数据
		const cookFormula = runtime.objects.CookFormula.getFirstInstance().getJsonDataCopy();
		
		// 从 localVars 中获取 formula 和 filterMethod
		const { formula, filterMethod } = localVars;
		
		// 解析 formula 字符串为对象
		const parsedFormula = JSON.parse(formula);
		
		// 查找匹配的食谱
		const matched = cookFormula.filter(recipe => {
		
		    // 检查食谱中的配料是否匹配
		    const ingredientsMatch = Object.keys(parsedFormula.Ingredient).every(ingredient => {
		        return recipe.Ingredients.includes(ingredient) && recipe.Ingredients.length === parsedFormula.Ingredient[ingredient];
		    });
		
		    // 检查搅拌和烹饪方法是否匹配
		    const mixingMatch = recipe.Mixing === parsedFormula.Mixing;
		    const methodMatch = recipe.Method === parsedFormula.Method;
		
		    return ingredientsMatch && mixingMatch && methodMatch;
		});
		
		// 提取匹配到的食谱名称数组
		const matchedRecipeNames = matched.map(recipe => recipe.Name);
		
		// 返回匹配结果
		runtime.setReturnValue(JSON.stringify(matchedRecipeNames));
	}

};

self.C3.ScriptsInEvents = scriptsInEvents;

