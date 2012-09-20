/// <reference path="C:\Program Files\Common Files\Microsoft Shared\Web Server Extensions\14\TEMPLATE\LAYOUTS\MicrosoftAjax.js" />
/// <reference path="C:\Program Files\Common Files\Microsoft Shared\Web Server Extensions\14\TEMPLATE\LAYOUTS\SP.debug.js" />
/// <reference path="C:\Program Files\Common Files\Microsoft Shared\Web Server Extensions\14\TEMPLATE\LAYOUTS\SP.Core.debug.js" />

ExecuteOrDelayUntilScriptLoaded(function () {

    SPNow = (function (spC) {

        //Private variables
        

        //Private Methods.

        //Sanitize the url value by appending a "/" if not already present.
        var CheckEndingSlash = function (value) {
            return value === "/" ? value : value + "/";
        };

        //Function to check whether a page is in edit mode.
        //Not working if on WikiPage. Need to fix it.
        var DeterminePageEditMode = function () {
            if (typeof PageState === "undefined") {
                return;
            }
            //If page is a Wiki Page.
            if (PageState.ItemIsWikiPage === "1") {
                if (document.forms[MSOWebPartPageFormName]._wikiPageMode.value === "Edit") {

                    return true;
                }
                else {

                    return false;
                }
            }//If page is any other type of page.
            else {
                if (document.forms[MSOWebPartPageFormName].MSOLayout_InDesignMode.value === "1") {
                    return true;
                }
                else {
                    return false;
                }
            }
        };

        var InitializeUser = function () {
            var properties, funcToExecute;

            //Check if the first argument is the callback function
            //If yes, then no properties are specified.
            if (typeof arguments[0] == "function") {
                funcToExecute = arguments[0];
            }
            else {//If no, then properties are specified and the seconf argument is the callback function.
                properties = arguments[0];
                funcToExecute = arguments[1];
            }

            var context = SP.ClientContext.get_current();
            var user = context.get_web().get_siteUserInfoList().getItemById(SPNow.User.ID);
            //If properties are specified by the user

            if (properties && properties.length > 0) {
                for (var i = 0; i < properties.length; i++) {
                    context.load(user, properties[i]);
                }
            }//If user wants to load all properties.
            else {
                context.load(user);
            }
            context.executeQueryAsync(function () {

                //If user has specified proprties
                if (properties !== undefined) {

                    for (var i = 0; i < properties.length; i++) {
                        //The Picture Column is a lookup column and hence the value has to be fetched differenctly.
                        if (properties[i] == "Picture") {
                            SPNow.User[properties[i]] = user.get_item(properties[i]).get_url();
                        }
                        else {
                            SPNow.User[properties[i]] = user.get_item(properties[i]);
                        }
                    }
                }//If all properties are to be fetched.
                else {
                    //Loop over all properties.
                    for (property in SPNow.User) {
                        //Ignore the Init proprty as its a function for Initialization.
                        if (property != "Init") {
                            //The Picture Column is a lookup column and hence the value has to be fetched differenctly.
                            if (property == "Picture") {
                                SPNow.User[property] = user.get_item(property).get_url();
                            }
                            else {
                                SPNow.User[property] = user.get_item(property);
                            }
                        }
                    }
                }
                //Execute the callback function.
                funcToExecute.apply();

            }, function (sender, args) { alert(args.get_message()); });

        };

        var InitializeSite = function (funcToExecute) {

            var context = SP.ClientContext.get_current();
            var site = context.get_site();
            context.load(site,'Usage');
            context.executeQueryAsync(function () {

                SPNow.Site.Usage.Bandwidth = site.get_usage().get_bandwidth();;
                SPNow.Site.Usage.DiscussionStorage = site.get_usage().get_discussionStorage();
                SPNow.Site.Usage.Hits = site.get_usage().get_hits();
                SPNow.Site.Usage.Storage = site.get_usage().get_storage();
                SPNow.Site.Usage.StoragePercentUsed = site.get_usage().get_storagePercentageUsed();
                SPNow.Site.Usage.Visits = site.get_usage().get_visits();

                funcToExecute.apply();

            }, function (sender, args) { alert(args.get_message()); });

        };
        
        //Public Object.
        return {
            Current: {
                WebUrl: CheckEndingSlash(spC.webServerRelativeUrl),
                AlertsEnabled: spC.alertsEnabled,
                AllowSilverlightPrompt: spC.allowSilverlightPrompt,
                Language: spC.currentLanguage,
                WebLanguage: spC.webLanguage,
            },
            Page: {
                ItemId: spC.pageItemId,
                ListId: spC.pageListId,
                EditMode: DeterminePageEditMode(),
            },
            User: {
                ID: spC.userId,
                Title: "",
                Name: "",
                EMail: "",
                MobilePhone: "",
                Notes: "",
                SipAddress: "",
                IsSiteAdmin: "",
                Picture: "",
                Title: "",
                Department: "",
                JobTitle: "",
                FirstName: "",
                LastName: "",
                WorkPhone: "",
                UserName: "",
                WebSite: "",
                Office: "",
                Init: InitializeUser,
            },
            Site: {
                Url: CheckEndingSlash(spC.siteServerRelativeUrl),
                Usage: {
                    Bandwidth: "",
                    DiscussionStorage: "",
                    Hits: "",
                    Storage: "",
                    StoragePercentUsed: "",
                    Visits: ""
                },
                Init: InitializeSite
            }

        }

    })(_spPageContextInfo);

    //Notify the page that the script of the plugin has completed loading.
    SP.SOD.notifyScriptLoadedAndExecuteWaitingJobs("spnow.js");

}, "sp.js");

