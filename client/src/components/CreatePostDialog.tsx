import { useState, useRef, ChangeEvent } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFeed } from "@/hooks/useFeed";
import { Image as ImageIcon, Loader2, Link, MapPin, Globe, Lock, Tag, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreatePostDialog = ({ open, onOpenChange }: CreatePostDialogProps) => {
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaTab, setMediaTab] = useState<"url" | "upload">("upload");
  const [privacy, setPrivacy] = useState<"public" | "friends" | "private">("public");
  const [location, setLocation] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [allowComments, setAllowComments] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { createPost, isPending } = useFeed();

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setImageFile(file);
      // Create local URL for preview
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      // For now, we'll just use this URL since we don't have a real server for file uploads
      setMediaUrl(url);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setPreviewUrl(null);
    setMediaUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim()) && tags.length < 5) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;
    
    // In a real implementation, we would upload the image to a server first
    // and get back a URL to store with the post
    
    const postData = {
      content: content,
      mediaUrl: mediaUrl || undefined,
      // These would be used in a more advanced implementation
      privacy: privacy,
      location: location || undefined,
      tags: tags.length > 0 ? tags : undefined,
      allowComments: allowComments
    };
    
    console.log("Creating post with data:", postData);
    
    await createPost(content, mediaUrl || undefined);
    resetForm();
    onOpenChange(false);
  };
  
  const resetForm = () => {
    setContent("");
    setMediaUrl("");
    setImageFile(null);
    setPreviewUrl(null);
    setPrivacy("public");
    setLocation("");
    setTags([]);
    setCurrentTag("");
    setAllowComments(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getPrivacyIcon = () => {
    switch (privacy) {
      case "public": return <Globe className="h-4 w-4" />;
      case "friends": return <Tag className="h-4 w-4" />;
      case "private": return <Lock className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newState) => {
      if (!newState) resetForm();
      onOpenChange(newState);
    }}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Создать новый пост</DialogTitle>
          <DialogDescription>
            Поделитесь своими мыслями, фотографиями или новостями с подписчиками.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <Textarea
            placeholder="О чем вы думаете?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px] resize-y"
          />
          
          <div className="space-y-3">
            <Label>Медиа</Label>
            <Tabs 
              value={mediaTab} 
              onValueChange={(v) => setMediaTab(v as "url" | "upload")}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="upload">Загрузить изображение</TabsTrigger>
                <TabsTrigger value="url">URL изображения</TabsTrigger>
              </TabsList>
              
              <TabsContent value="upload" className="space-y-3 pt-2">
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center gap-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                    >
                      <ImageIcon className="mr-2 h-4 w-4" />
                      Выбрать файл
                    </Button>
                    {previewUrl && (
                      <Button 
                        type="button" 
                        variant="destructive" 
                        size="icon"
                        onClick={handleRemoveImage}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                  />
                  <p className="text-xs text-muted-foreground">
                    Поддерживаемые форматы: JPG, PNG, GIF. Максимальный размер: 5MB.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="url" className="space-y-3 pt-2">
                <div className="flex items-center space-x-2">
                  <Link className="h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Вставьте URL изображения"
                    value={mediaUrl}
                    onChange={(e) => {
                      setMediaUrl(e.target.value);
                      setPreviewUrl(null);
                      setImageFile(null);
                    }}
                  />
                </div>
              </TabsContent>
            </Tabs>
            
            {(previewUrl || mediaUrl) && (
              <div className="mt-2 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800 aspect-video">
                <img 
                  src={previewUrl || mediaUrl} 
                  alt="Предпросмотр поста" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x300?text=Неверный+URL+изображения";
                  }}
                />
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <Label>Приватность</Label>
              <Select value={privacy} onValueChange={(value) => setPrivacy(value as "public" | "friends" | "private")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">
                    <div className="flex items-center">
                      <Globe className="mr-2 h-4 w-4" />
                      <span>Публичный</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="friends">
                    <div className="flex items-center">
                      <Tag className="mr-2 h-4 w-4" />
                      <span>Только друзья</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="private">
                    <div className="flex items-center">
                      <Lock className="mr-2 h-4 w-4" />
                      <span>Только я</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Местоположение</Label>
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Добавить местоположение (опционально)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Теги</Label>
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Добавить тег (нажмите Enter)"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button type="button" onClick={addTag} variant="secondary" disabled={!currentTag.trim() || tags.length >= 5}>
                Добавить
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map(tag => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  #{tag}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => removeTag(tag)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
              {tags.length === 0 && (
                <p className="text-xs text-muted-foreground">Добавьте до 5 тегов для улучшения видимости поста</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="allowComments"
              checked={allowComments}
              onCheckedChange={setAllowComments}
            />
            <Label htmlFor="allowComments">Разрешить комментарии</Label>
          </div>
        </div>
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex items-center text-xs text-muted-foreground">
            {getPrivacyIcon()}
            <span className="ml-1">
              {privacy === "public" ? "Публичный пост" : privacy === "friends" ? "Только для друзей" : "Приватный пост"}
            </span>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" className="flex-1 sm:flex-initial" onClick={() => {
              resetForm();
              onOpenChange(false);
            }}>
              Отмена
            </Button>
            <Button 
              className="flex-1 sm:flex-initial"
              onClick={handleSubmit} 
              disabled={!content.trim() || isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Публикация...
                </>
              ) : (
                "Опубликовать"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostDialog;
