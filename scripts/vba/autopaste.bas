Rem Sample String: FirstNamePlaceholder=Tap&LastNamePlaceholder=Forms&PrizePlaceholder=one+million+dollars&TransferAmount=$200&AddressPlaceholder=1%20Infinite%20Loop%0ACupertino%2C%20CA%2095014%0AUSA&SignatureName=Steve+Jobs&

Private Sub Document_New()
HandleClipboardRequest

End Sub

Public Sub HandleClipbaoardRequest()
Rem Force Add Reference
Rem ThisDocument.VBProject.References.AddFromGuid "{0D452EE1-E08F-101A-852E-02608C4D0BB4}", 2, 0

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
        Key = URLDecode(secondsplit(0))
        Value = URLDecode(Replace(secondsplit(1), "%0A", vbCr))
        Rem MsgBox ("key: " & Key & "; value: " & Value)
        replaceresult = DocumentReplace(Key, Value)
    End If
Next
End Sub


Public Function GetLength(a As Variant) As Integer
   If IsEmpty(a) Then
      GetLength = 0
   Else
      GetLength = UBound(a) - LBound(a) + 1
   End If
End Function

Public Function DocumentReplace(Key As String, Value As String)

With Selection.Find
 .ClearFormatting
 .Text = "__" & Key & "__"
 .Replacement.ClearFormatting
 .Replacement.Text = Value
 .Execute Replace:=wdReplaceAll, Forward:=True, _
 Wrap:=wdFindContinue
End With

End Function


Public Function URLEncode(StringToEncode As String, Optional _
   UsePlusRatherThanHexForSpace As Boolean = False) As String

Dim TempAns As String
Dim CurChr As Integer
CurChr = 1
Do Until CurChr - 1 = Len(StringToEncode)
  Select Case Asc(Mid(StringToEncode, CurChr, 1))
    Case 48 To 57, 65 To 90, 97 To 122
      TempAns = TempAns & Mid(StringToEncode, CurChr, 1)
    Case 32
      If UsePlusRatherThanHexForSpace = True Then
        TempAns = TempAns & "+"
      Else
        TempAns = TempAns & "%" & Hex(32)
      End If
   Case Else
         TempAns = TempAns & "%" & _
              Format(Hex(Asc(Mid(StringToEncode, _
              CurChr, 1))), "00")
End Select

  CurChr = CurChr + 1
Loop

URLEncode = TempAns
End Function


Public Function URLDecode(StringToDecode As String) As String

Dim TempAns As String
Dim CurChr As Integer

CurChr = 1

Do Until CurChr - 1 = Len(StringToDecode)
  Select Case Mid(StringToDecode, CurChr, 1)
    Case "+"
      TempAns = TempAns & " "
    Case "%"
      TempAns = TempAns & Chr(Val("&h" & _
         Mid(StringToDecode, CurChr + 1, 2)))
       CurChr = CurChr + 2
    Case Else
      TempAns = TempAns & Mid(StringToDecode, CurChr, 1)
  End Select

CurChr = CurChr + 1
Loop

URLDecode = TempAns
End Function


