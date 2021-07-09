package templates

import (
	"fmt"
	"github.com/dop251/goja"
)

const functionName = "process"

//Transform transforms javascript to ES5 compatible code + adds few tweaks to loosen some rules
func Transform(src string) (string, error) {
	res, err := TransformString(src, map[string]interface{}{
		"plugins": []interface{}{
			[]interface{}{"transform-last-statement", map[string]interface{}{"topLevel": true}},
			"proposal-optional-chaining",
			"transform-template-literals",
		},
		"parserOpts":  map[string]interface{}{
			"errorRecovery": true,
			"strictMode": false,
			"allowReturnOutsideFunction": true,
			"allowSuperOutsideMethod": true},
	})
	if err != nil {
		return "",err
	}
	return `function ` + functionName + `(event) { 
        var $ = event;
        var _ = event;
		` + res +`
		};`, nil
}

//LoadTemplateScript loads script into newly created Javascript vm
//Returns func that is mapped to javascript function inside vm instance
func LoadTemplateScript(script string) (func(map[string]interface{}) interface{}, error) {
	vm := goja.New()
	_, err := vm.RunString(script)
	if err != nil {
		return nil, err
	}
	var fn func(map[string]interface{}) interface{}
	err = vm.ExportTo(vm.Get(functionName), &fn)
	if err != nil {
		return nil, err
	}
	return fn, nil
}

//ProcessEvent runs javascript function loaded into specified vm on provided event object
func ProcessEvent(function func(map[string]interface{}) interface{}, event map[string]interface{}) (result interface{}, err error) {
	//panic handler
	defer func() {
		if r := recover(); r != nil {
			result = nil
			err = fmt.Errorf("javascript error: %v", r)
		}
	}()
	result = function(event)
	return
}
