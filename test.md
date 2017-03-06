Test markdown stuff
===

<script type="text/javascript">

import * as vscode from 'vscode';
function getCurEditName() {
    alert(vscode.window.activeTextEditor.document.fileName);
}
</script>

A link into code?
--

[ext:10](file:./test.md#7,3)

<a href="javascript:getCurEditName()">test js</a>