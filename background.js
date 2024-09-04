const bangCommands = {
    '!yt': 'https://www.youtube.com/results?search_query=',
    '!g': 'https://www.google.com/search?q=',
    '!d': 'https://duckduckgo.com/?q=',
    '!w': 'https://en.wikipedia.org/w/index.php?search=',
    '!a': 'https://www.amazon.com/s?k=',
    '!r': 'https://www.reddit.com/search/?q=',
    '!gh': 'https://github.com/search?q=',
    '!so': 'https://stackoverflow.com/search?q=',
    '!m': 'https://www.google.com/maps/search/',
    '!p': 'https://www.perplexity.ai/search?q=',
    '!b': 'https://www.bing.com/search?q=',
    '!i': 'https://www.google.com/search?tbm=isch&q=',
    '!n': 'https://news.google.com/search?q=',
    '!t': 'https://twitter.com/search?q=',
    '!l': 'https://www.linkedin.com/search/results/all/?keywords=',
    '!f': 'https://www.facebook.com/search/top/?q=',
    '!e': 'https://www.ebay.com/sch/i.html?_nkw=',
    '!imdb': 'https://www.imdb.com/find?q=',
    '!s': 'https://open.spotify.com/search/',
    '!tr': 'https://translate.google.com/?text=',
    '!wa': 'https://www.wolframalpha.com/input/?i=',
    '!dict': 'https://www.dictionary.com/browse/',
    '!th': 'https://www.thesaurus.com/browse/',
    '!gs': 'https://scholar.google.com/scholar?q=',
    '!c': 'https://claude.ai/new?q=',
    '!gpt': 'https://chatgpt.com/?q=',
  };
  
  function generateRules() {
    let rules = [];
    let ruleId = 1;

    for (const [bang, redirectUrl] of Object.entries(bangCommands)) {
      // Rule for bang at the start
      rules.push({
        "id": ruleId++,
        "priority": 1,
        "action": {
          "type": "redirect",
          "redirect": {
            "regexSubstitution": redirectUrl + "\\1"
          }
        },
        "condition": {
          "regexFilter": "^https?://www\\.google\\.com/search\\?.*q=" + bang + "\\+(.*)$|^https?://www\\.google\\.com/search\\?.*q=" + bang + "%20(.*)$",
          "resourceTypes": ["main_frame"]
        }
      });

      // Rule for bang at the end
      rules.push({
        "id": ruleId++,
        "priority": 1,
        "action": {
          "type": "redirect",
          "redirect": {
            "regexSubstitution": redirectUrl + "\\1"
          }
        },
        "condition": {
          "regexFilter": "^https?://www\\.google\\.com/search\\?.*q=(.*)\\+" + bang + "$|^https?://www\\.google\\.com/search\\?.*q=(.*)%20" + bang + "$",
          "resourceTypes": ["main_frame"]
        }
      });
    }

    return rules;
  }
  
  // Generate rules
  const rules = generateRules();
  
  // Function to add rules one by one
  function addRulesSequentially(rules, index = 0) {
    if (index >= rules.length) {
      console.log("All rules added successfully");
      return;
    }

    chrome.declarativeNetRequest.updateDynamicRules({
      addRules: [rules[index]]
    }, () => {
      if (chrome.runtime.lastError) {
        console.error(`Error adding rule ${index + 1}:`, chrome.runtime.lastError);
        console.error("Problematic rule:", JSON.stringify(rules[index], null, 2));
      } else {
        console.log(`Rule ${index + 1} added successfully`);
      }
      addRulesSequentially(rules, index + 1);
    });
  }
  
  // Remove existing rules and add new ones
  chrome.declarativeNetRequest.getDynamicRules((existingRules) => {
    const existingRuleIds = existingRules.map(rule => rule.id);
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: existingRuleIds
    }, () => {
      if (chrome.runtime.lastError) {
        console.error("Error removing existing rules:", chrome.runtime.lastError);
      } else {
        console.log("Existing rules removed successfully");
        addRulesSequentially(rules);
      }
    });
  });
  
  // Log the rules for debugging
  console.log("Generated rules:", JSON.stringify(rules, null, 2));
  
  // Add a listener for when a rule is matched
  chrome.declarativeNetRequest.onRuleMatchedDebug.addListener((info) => {
    console.log("Rule matched:", info);
  });
  
  // Add a listener for web navigation to log URL changes
  chrome.webNavigation.onBeforeNavigate.addListener((details) => {
    console.log("Navigation detected:", details.url);
  });