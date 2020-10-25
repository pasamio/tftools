Private Sub Document_New()
    HandleClipboardRequest
End Sub

Public Sub testASURLDecode()
    Dim inputString As String
    inputString = "FirstNamePlaceholder=%C3%84lb%C3%A9rt&LastNamePlaceholder=Schlo%C3%9Fanger"
    MsgBox ASURLDecode(inputString)
End Sub


Public Function ASURLDecode(inputValue As String) As String
    ASURLDecode = AppleScriptTask("TFIntegration.scpt", "decodeURIComponent", inputValue)
End Function

Public Sub HandleClipboardRequest()
    Dim MyData As MSForms.DataObject
    Dim strClip As String

    Set MyData = New MSForms.DataObject
    MyData.GetFromClipboard
    strClip = MyData.GetText

    Dim firstsplit() As String
    Dim secondsplit() As String
    Dim Key As String
    Dim Value As String

    firstsplit = Split(strClip, "&")

    For Each Pair In firstsplit
        secondsplit = Split(Pair, "=")
        If GetLength(secondsplit) = 2 Then
            Key = ASURLDecode(secondsplit(0))
            Value = ASURLDecode(Replace(secondsplit(1), "%0A", vbCr))
            FindReplaceAnywhere Key, Value
        End If
    Next
End Sub


Rem Better Find and Replace from here: https://wordmvp.com/FAQs/Customization/ReplaceAnywhere.htm
Public Sub FindReplaceAnywhere(Key As String, Value As String)
  Dim rngStory As Word.Range
  Dim pFindTxt As String
  Dim pReplaceTxt As String
  Dim lngJunk As Long
  Dim oShp As Shape
  pFindTxt = "__" & Key & "__"
  pReplaceTxt = Value

  'Fix the skipped blank Header/Footer problem
  lngJunk = ActiveDocument.Sections(1).Headers(1).Range.StoryType
  'Iterate through all story types in the current document
  For Each rngStory In ActiveDocument.StoryRanges
    'Iterate through all linked stories
    Do
      SearchAndReplaceInStory rngStory, pFindTxt, pReplaceTxt
      On Error Resume Next
      Select Case rngStory.StoryType
      Case 6, 7, 8, 9, 10, 11
        If rngStory.ShapeRange.Count > 0 Then
          For Each oShp In rngStory.ShapeRange
            If oShp.TextFrame.HasText Then
              SearchAndReplaceInStory oShp.TextFrame.TextRange, _
                  pFindTxt, pReplaceTxt
            End If
          Next
        End If
      Case Else
        'Do Nothing
      End Select
      On Error GoTo 0
      'Get next linked story (if any)
      Set rngStory = rngStory.NextStoryRange
    Loop Until rngStory Is Nothing
  Next
End Sub

Public Sub SearchAndReplaceInStory(ByVal rngStory As Word.Range, _
    ByVal strSearch As String, ByVal strReplace As String)
  With rngStory.Find
    .ClearFormatting
    .Replacement.ClearFormatting
    .Text = strSearch
    .Replacement.Text = strReplace
    .Wrap = wdFindContinue
    .Execute Replace:=wdReplaceAll
  End With
End Sub


